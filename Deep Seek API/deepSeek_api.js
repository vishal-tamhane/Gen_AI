// deepSeek_api.js
// Node.js 18+ supports fetch natively\
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  throw new Error("❌ No API key found. Please set DEEPSEEK_API_KEY environment variable.");
}

const url = "https://api.deepseek.com/v1/chat/completions";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

const data = {
  model: "deepseek-chat",
  messages: [{ role: "user", content: "Hello from DeepSeek API (Native fetch)!" }]
};

async function run() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.choices) {
      console.log("✅ Response:", result.choices[0].message.content);
    } else {
      console.error("❌ API returned an error:");
      console.error(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
}

run();
