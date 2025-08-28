import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import { exec } from "child_process";
import * as util from "node:util";
import * as os from "os";

dotenv.config();

// Create main API client
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const execPromise = util.promisify(exec);

// ---------- Local Functions ----------
async function executeCommands({command}) {
    try {
        const {stdout, stderr} = await execPromise(command);
        if (stderr) {
            return `Error executing command: ${stderr}`;
        }
        return `Success: ${stdout}`;
    } catch (error) {
        return `Error executing command: ${error.message}`;
    }
}

// ---------- Function Declarations ----------
const executeCommandsDeclaration = {
    name: "executeCommands",
    description: "Executes terminal/shell commands on the local machine",
    parameters: {
        type: "object",
        properties: {
            command: { type: "string", description: "The command to execute" }
        },
        required: ["command"]
    }
};

// ---------- Run Agent ----------
async function runAgent(userInput) {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-pro" });
        
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `You are a website builder expert. Create a frontend based on user input.
Current operating system: ${os.platform()}

Capabilities:
- You can execute terminal commands using the executeCommands function
- Commands should be appropriate for the user's operating system

Follow this sequence:
1. Create a project directory
2. Create necessary files (HTML, CSS, JS)
3. Add code to the files
4. Make corrections if needed
5. Clean up if necessary

User request: ${userInput}`
                }]
            }]
        });
        
        const response = await result.response;
        if (response.candidates && response.candidates[0]) {
            const content = response.candidates[0].content;
            if (content.parts && content.parts[0]) {
                if (content.parts[0].functionCall) {
                    const functionCall = content.parts[0].functionCall;
                    if (functionCall.name === "executeCommands") {
                        const cmdResult = await executeCommands(functionCall.args);
                        console.log(`Command Result: ${cmdResult}`);
                    }
                } else if (content.parts[0].text) {
                    console.log("AI:", content.parts[0].text);
                }
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ---------- Main Loop ----------
async function main() {
    console.log("🤖 I am Cursor, Let's Create the website, type 'exit' to close the terminal\n");
    
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
