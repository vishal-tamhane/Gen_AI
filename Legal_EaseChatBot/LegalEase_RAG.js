import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GenAi_Api_Key });

// Load database
const legalData = JSON.parse(fs.readFileSync('legal_database.json', 'utf-8'));

// Search function (fuzzy match)
async function searchDatabase(query) {
  query = query.toLowerCase();
  return legalData.filter(item =>
    query.includes(item.section.toLowerCase()) ||
    query.includes(item.title.toLowerCase()) ||
    query.includes(item.text.toLowerCase())
  );
}

// Ask Gemini to normalize the query
async function normalizeQuery(userQuestion) {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `Extract only the law reference or relevant legal keyword from this question. 
                   Do not add extra words. 
                   Examples:
                   "What is the IPC 302" -> "IPC 302"
                   "Tell me about section 420" -> "IPC 420"
                   "Penalty for murder" -> "IPC 302"
                   Now process: "${userQuestion}"`
          }]
        }
      ]
    });

    return res?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || userQuestion;
  } catch (err) {
    console.error("Error normalizing query:", err);
    return userQuestion; // fallback to original
  }
}

// Ask Gemini to answer the question directly
async function getAiAnswer(userQuestion) {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are a helpful legal assistant. Answer clearly and concisely: "${userQuestion}"`
          }]
        }
      ]
    });

    return res?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error("Error getting AI answer:", err);
    return null;
  }
}

async function main() {
  const userQuestion = process.argv.slice(2).join(" ");
  if (!userQuestion) {
    console.error("Please provide a question.");
    return;
  }

  console.log(`User que:: ${userQuestion}`);

  // Step 1: Normalize
  const cleanQuery = await normalizeQuery(userQuestion);
  console.log(`Normalized query:: ${cleanQuery}`);

  // Step 2: Search DB
  const matches = await searchDatabase(cleanQuery);

  if (matches.length > 0) {
    const directAnswer = matches.map(m => `${m.section} - ${m.title}: ${m.text}`).join("\n");
    console.log(`Ai ans:: ${directAnswer}`);
    return;
  }

  // Step 3: No DB match → Ask AI
  const aiAnswer = await getAiAnswer(userQuestion);

  if (aiAnswer) {
    console.log(`Ai ans:: ${aiAnswer}`);
    return;
  }

  // Step 4: No AI answer → placeholder for external agents/functions
  console.log("Ai ans:: No answer found. Passing to external agent...");
}

await main();
