import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
dotenv.config();
// 🔐 Use your actual API key here
const genAI = new GoogleGenerativeAI(process.env.GenAi_Api_Key);

const history = [];

async function chatting(userProblem) {
    history.push({
        role: "user",
        parts: [{ text: userProblem }],
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const result = await model.generateContent({ contents: history });

    const response = await result.response.text();
    console.log("AI:", response);

    history.push({
        role: "model",
        parts: [{ text: response }],
    });
}

async function main() {
    while (true) {
        const userInput = readlineSync.question("\nYou: ");
        if (userInput.toLowerCase() === "exit") {
            console.log("Ending chat. Goodbye!");
            break;
        }

        await chatting(userInput);
    }
}

main();
