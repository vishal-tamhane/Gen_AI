import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";

dotenv.config();


// ✅ Create main API client
const genAI = new GoogleGenerativeAI({
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
    type: "object",
    properties: {
      num1: { type: "number", description: "First number" },
      num2: { type: "number", description: "Second number" }
    },
    required: ["num1", "num2"]
  }
};

const PrimeDeclaration = {
  name: "isPrime",
  description: "Check whether a number is prime or not",
  parameters: {
    type: "object",
    properties: {
      num: { type: "number", description: "Number to check" }
    },
    required: ["num"]
  }
};

// ---------- Conversation History ----------
let History = [];

// ---------- Run Agent ----------
async function runAgent(UserProblem) {
  History.push({
    role: "user",
    parts: [{ text: UserProblem }]
  });

  try {
    // 📌 Get model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // First call — let Gemini decide if it needs a function
    const response = await model.generateContent({
      contents: History,
      tools: [{ functionDeclarations: [SumDeclaration, PrimeDeclaration] }]
    });

    const parts = response.response?.candidates?.[0]?.content?.parts || [];
    const functionCallPart = parts.find(p => p.functionCall);

    if (functionCallPart) {
      const { name, args: rawArgs } = functionCallPart.functionCall;
      let args = rawArgs;
      if (typeof args === "string") {
        try { args = JSON.parse(args); } catch { args = {}; }
      }

      let result;
      if (name === "SumGet") {
        result = SumGet(args.num1, args.num2);
      } else if (name === "isPrime") {
        result = isPrime(args.num);
      }

      // Push function result
      History.push({
        role: "function",
        parts: [{
          functionResponse: {
            name,
            response: { result }
          }
        }]
      });

      // Ask for a human-readable explanation
      History.push({
        role: "user",
        parts: [{ text: "Explain the result above in a user-friendly sentence." }]
      });

      const followUp = await model.generateContent({ contents: History });
      const followUpParts = followUp.response?.candidates?.[0]?.content?.parts || [];
      const textFollowUp = followUpParts.map(p => p.text).filter(Boolean).join("\n");

      console.log(`AI: ${textFollowUp || result}`);

    } else {
      // Just return plain text if no function call
      const textResponse = parts.map(p => p.text).filter(Boolean).join("\n");
      console.log(`AI: ${textResponse}`);
    }
  } catch (err) {
    console.error("❌ API Call Failed:", err);
  }
}

// ---------- Main Loop ----------
async function main() {
  while (true) {
    const userInput = readlineSync.question("\nYou: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("Ending chat. Goodbye!");
      break;
    }
    await runAgent(userInput);
  }
}

main();
