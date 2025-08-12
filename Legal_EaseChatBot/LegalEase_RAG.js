// LegalEase_RAG.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Instantiate Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GenAi_Api_Key });

// Load local legal database
let legalData = [];
try {
  legalData = JSON.parse(fs.readFileSync("legal_database.json", "utf-8"));
} catch (err) {
  console.error("Failed to load legal_database.json:", err);
  process.exit(1);
}

// ---------------- DB Search ----------------
function searchDatabase(query) {
  const stopwords = new Set([
    "i", "the", "a", "an", "and", "to", "is", "am", "are", "was", "were", "of", "for",
    "on", "in", "at", "by", "with", "my", "me", "you", "your"
  ]);

  query = query.toLowerCase().trim();
  const qTokens = query.split(/\s+/).filter(t => !stopwords.has(t));

  // Exact IPC section match
  const exactMatch = legalData.filter(item =>
    query.includes(item.section.toLowerCase())
  );
  if (exactMatch.length) return exactMatch;

  // Keyword scoring
  const results = legalData
    .map(item => {
      const combined = `${item.section} ${item.title} ${item.text}`.toLowerCase();
      let score = 0;
      qTokens.forEach(t => {
        if (combined.includes(t)) score += 1;
      });
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

// ---------------- Query Normalization ----------------
async function normalizeQuery(userQuestion) {
  const prompt = `You are a brief query-normalizer for a legal chatbot. Extract the most relevant IPC section(s) or keyword(s) from the question.

Rules:
- If explicit IPC section → return it exactly (e.g., "IPC 302").
- If description of a crime → return the IPC section(s) or crime keyword.
- If multiple → separate by commas.
- If unsure → return 1-2 keyword summary.

Return ONLY the normalized reference(s).

Examples:
"What is the IPC 302" → "IPC 302"
"I killed someone" → "IPC 302"
"I forged a document" → "IPC 465"

Now process: "${userQuestion}"`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const normalized = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!normalized) return userQuestion;
    return normalized.replace(/\r?\n/g, " ").trim();
  } catch (err) {
    console.error("normalizeQuery error:", err);
    return userQuestion;
  }
}

// ---------------- LLM Fallback ----------------
async function getAiLegalFallback(userQuestion) {
  const prompt = `You are a legal assistant with strong knowledge of Indian Penal Code (IPC).
If the answer is known, give a concise reply citing the relevant IPC section(s) and short explanation.
If you truly don't know, reply: UNKNOWN.

User question:
"${userQuestion}"`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text || /^UNKNOWN$/i.test(text)) return null;
    return text;
  } catch (err) {
    console.error("getAiLegalFallback error:", err);
    return null;
  }
}

// ---------------- Main Flow ----------------
async function main() {
  const userQuestion = process.argv.slice(2).join(" ").trim();
  if (!userQuestion) {
    console.error("Please provide a question. Example:");
    console.error('  node LegalEase_RAG.js "What is the IPC 302"');
    process.exit(1);
  }

  console.log(`User que:: ${userQuestion}`);

  // 1. Normalize query
  const normalized = await normalizeQuery(userQuestion);
  console.log(`Normalized query:: ${normalized}`);

  // 2. Search DB
  let matches = searchDatabase(normalized);

  // 3. Also try searching with raw question if no match
  if (!matches.length) matches = searchDatabase(userQuestion);

  // 4. DB hit → return result
  if (matches.length) {
    const answer = matches.map(m => `${m.section} - ${m.title}: ${m.text}`).join("\n\n");
    console.log(`Ai ans:: ${answer}`);
    return;
  }

  // 5. DB miss → LLM fallback
  const fallback = await getAiLegalFallback(userQuestion);
  if (fallback) {
    console.log(`Ai ans:: ${fallback}`);
    return;
  }

  // 6. Nothing found
  console.log(`Ai ans:: I do not have that information in my legal database. Please consult a qualified lawyer for advice.`);
}

await main();
