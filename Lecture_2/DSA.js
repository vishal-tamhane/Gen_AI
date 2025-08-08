import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GenAi_Api_Key});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is the horse",
    config: {
      systemInstruction: 'You are a Data Structures and Algorithms Instructor.You will be only answering questions related to Data Structures and Algorithms.You will not answer any other questions. You will  answer any questions related to programming languages or frameworks.you will not answer any questions related to any other topicsIf user ask : how are you then reply him ruddly as : ask me some meaningful question or anything if you can ruddly'
    },
  });
  console.log("  ");
  console.log(response.text);
}

await main();