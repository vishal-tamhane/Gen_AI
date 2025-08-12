import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import fs from "fs";
import path from "path";

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Please set GOOGLE_API_KEY in your .env file");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// --- Local file tool functions ---

function createFile({ path: filePath, content }) {
  const fullPath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  return `Created file at ${filePath}`;
}

function readFile({ path: filePath }) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return `File not found: ${filePath}`;
  return fs.readFileSync(fullPath, "utf8");
}

function appendToFile({ path: filePath, content }) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return `File not found: ${filePath}`;
  fs.appendFileSync(fullPath, content, "utf8");
  return `Appended content to ${filePath}`;
}

// --- Function Declarations for Gemini ---

const createFileDeclaration = {
  name: "createFile",
  description: "Create a new file with specified content",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: { type: Type.STRING, description: "File path" },
      content: { type: Type.STRING, description: "Content of the file" },
    },
    required: ["path", "content"],
  },
};

const readFileDeclaration = {
  name: "readFile",
  description: "Read content of a specified file",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: { type: Type.STRING, description: "File path" },
    },
    required: ["path"],
  },
};

const appendToFileDeclaration = {
  name: "appendToFile",
  description: "Append content to an existing file",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: { type: Type.STRING, description: "File path" },
      content: { type: Type.STRING, description: "Content to append" },
    },
    required: ["path", "content"],
  },
};

async function runAgent(userInput) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `If the user input requires file operations, call the appropriate tool. Otherwise answer directly.\n\nUser: ${userInput}`,
    config: {
      tools: [{
        functionDeclarations: [
          createFileDeclaration,
          readFileDeclaration,
          appendToFileDeclaration,
        ]
      }]
    }
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const { name, args } = response.functionCalls[0];
    let result;
    if (name === "createFile") result = createFile(args);
    else if (name === "readFile") result = readFile(args);
    else if (name === "appendToFile") result = appendToFile(args);
    else result = "Unknown function called.";

    console.log(`Function called: ${name}`);
    console.log(`Args: ${JSON.stringify(args)}`);
    console.log(`Result: ${result}`);
  } else {
    console.log("AI:", response.text);
  }
}

async function main() {
  console.log("🤖 miniCursor started! Type 'exit' to quit.\n");
  while (true) {
    const userInput = readlineSync.question("You: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }
    await runAgent(userInput);
  }
}

main();
