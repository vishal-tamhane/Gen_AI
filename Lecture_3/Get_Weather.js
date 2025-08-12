import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();

// ✅ Create main API client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// ---------- Local Functions ----------
function SumGet(num1, num2) {
  return num1 + num2;
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// ---------- Function Declarations ----------
const SumDeclaration = {
  name: "SumGet",
  description: "Get the sum of two numbers",
  parameters: {
    type: Type.OBJECT,
    properties: {
      num1: { type: Type.NUMBER, description: "First number" },
      num2: { type: Type.NUMBER, description: "Second number" }
    },
    required: ["num1", "num2"]
  }
};

const PrimeDeclaration = {
  name: "isPrime",
  description: "Check whether a number is prime or not",
  parameters: {
    type: Type.OBJECT,
    properties: {
      num: { type: Type.NUMBER, description: "Number to check" }
    },
    required: ["num"]
  }
};

// ---------- Run Agent ----------
async function runAgent(userInput) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `If the question can be answered without using the provided tools, answer directly. Otherwise, call the appropriate tool.\n\nUser: ${userInput}`,
    config: {
      tools: [{
        functionDeclarations: [SumDeclaration, PrimeDeclaration]
      }]
    }
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const { name, args } = response.functionCalls[0];

    let result;
    if (name === "SumGet") {
      result = SumGet(args.num1, args.num2);
    } else if (name === "isPrime") {
      result = isPrime(args.num);
    }

    console.log(`Function: ${name}`);
    console.log(`Args: ${JSON.stringify(args)}`);
    console.log(`Result: ${result}`);
  } else {
    console.log("AI:", response.text);
  }
}

// ---------- Main Loop ----------
async function main() {
  console.log("🤖 AI Agent started! Type 'exit' to quit.\n");
  while (true) {
    const userInput = readlineSync.question("You: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("👋 Ending chat. Goodbye!");
      break;
    }
    await runAgent(userInput);
  }
}

main();
