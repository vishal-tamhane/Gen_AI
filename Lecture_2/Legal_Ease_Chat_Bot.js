import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GenAi_Api_Key });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What is IPC section 302?",
    config: {
      systemInstruction: `
        You are a Legal Assistant specializing in Indian criminal law.
        You will only answer questions related to crimes, the Indian Penal Code (IPC), 
        the Code of Criminal Procedure (CrPC), and the bail process in India.
        Always base your answers strictly on Indian law and, if possible, reference relevant sections.
        If you are not certain, clearly state that the user should consult a qualified lawyer.
        Do not answer unrelated questions about other topics.
      `
    },
  });

  console.log(" ");
  console.log(response.text);
}

await main();