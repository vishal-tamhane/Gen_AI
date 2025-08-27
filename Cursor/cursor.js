import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const platform = os.platform();
const asyncExecute = promisify(exec);
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


async function executeCommand({command}) {
    try {
        const {stdout, stderr} = await asyncExecute(command);
        if (stderr && !stderr.includes('success')) {  // Some Windows commands output to stderr even on success
            return `Error: ${stderr}`;
        }
        return `Success: ${stdout || 'Command executed successfully'}`;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

const executeCommandDeclaration = {
    name: "executeCommand",
    description: "Execute a terminal/shell command",
    parameters: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "The command to execute (e.g., mkdir calculator)"
            }
        },
        required: ["command"]
    }
}



async function runAgent(userProblem) {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    
    const chat = model.startChat({
        history: [],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        }
    });

    const prompt = `You are a website builder expert. Create a frontend website based on user input.
Current operating system: ${platform}

You can use these commands to create files:
For HTML: echo "<content>" > filename.html
For CSS: echo "<content>" > filename.css
For JS: echo "<content>" > filename.js

First analyze what type of website to build, then:
1. Create a new directory
2. Create and write to HTML, CSS, JS files
3. Make sure the files work together

User request: ${userProblem}

// Now you can give them command in following below
1: First create a folder, Ex: mkdir "calulator"
2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
3: Then create style.css same as above
4: Then create script.js
5: Then write a code in html file

You have to provide the terminal or shell command to user, they will directly execute it
`;

    const chat = model.startChat({
        history: [],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
        tools: [{
            functionDeclarations: [executeCommandDeclaration]
        }]
    });


    try {
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        
        if (response.candidates && response.candidates[0].content.parts[0].functionCall) {
            const functionCall = response.candidates[0].content.parts[0].functionCall;
            if (functionCall.name === "executeCommand") {
                const cmdResult = await executeCommand(functionCall.args);
                console.log(`Command Result: ${cmdResult}`);
            }
        } else if (response.candidates && response.candidates[0].content.parts[0].text) {
            const commands = response.candidates[0].content.parts[0].text;
            console.log("Commands to run:", commands);
            
            // Execute each command
            const commandLines = commands.split('\n').filter(cmd => cmd.trim());
            for (const cmd of commandLines) {
                if (cmd.trim()) {
                    console.log(`Executing: ${cmd}`);
                    const result = await executeCommand({ command: cmd });
                    console.log(`Result: ${result}`);
                }
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}


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

main().catch(error => {
    console.error("Error:", error.message);
});





