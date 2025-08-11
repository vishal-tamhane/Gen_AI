import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GenAi_Api_Key });

// Load DB
const legalData = JSON.parse(fs.readFileSync('legal_database.json', 'utf-8'));

async function searchDatabase(query) {
  query = query.toLowerCase();
  return legalData.filter(item =>
    item.section.toLowerCase().includes(query) ||
    item.text.toLowerCase().includes(query) ||
    (item.examples && item.examples.some(ex => ex.toLowerCase().includes(query)))
  );
}

async function main() {
  const userQuestion = process.argv.slice(2).join(" ");
  if (!userQuestion) {
    console.error("Please provide a question.");
    return;
  }

  // Search local DB first
  const matches = await searchDatabase(userQuestion);

  if (matches.length > 0) {
    // Direct answer from DB
    const directAnswer = matches.map(m => `${m.section} - ${m.title}: ${m.text}`).join("\n");
    console.log(`User que:: ${userQuestion}`);
    console.log(`Ai ans:: ${directAnswer}`);
    return; // Skip calling Gemini if we already found the answer
  }

  // If not found, use Gemini
  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Answer the question: ${userQuestion}` }]
        }
      ]
    });
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return;
  }

  const aiAnswer =
    response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer from model";

  console.log(`User que:: ${userQuestion}`);
  console.log(`Ai ans:: ${aiAnswer}`);
}

await main();
