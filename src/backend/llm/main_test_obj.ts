import * as readline from "readline";
import dotenv from "dotenv";
import { askGroq } from "./others_llm/groq.js";
import type { RoomChatMessage } from "./types/messages.js";
import { askGemini } from "./others_llm/gemini.js";
import { Llm } from "./personnality.js";
import EventEmitter from "node:events";

dotenv.config({ path: ".env" });

const { pipeline } = await import("./pipeline.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer: string) => resolve(answer));
    });
}

async function main() {
    console.log("\x1b[47mllm-test -> tape 'exit' pour quitter\x1b[0m\n");

    const emitter_test = new EventEmitter();
    const llmOjb = new Llm("room1", emitter_test);

    while (true) {
        const userInput = await ask("\x1b[32mPlayer : \x1b[0m");

        if (userInput === "exit") {
            console.log("\x1b[31mBye !\x1b[0m");
            rl.close();
            break;
        }

        const chatHistory: RoomChatMessage[] = [
            {
                senderId: "player1",
                content: userInput,
                timestamp: Date.now(),
            },
        ];
        await pipeline(llmOjb);
    }
}

main();
