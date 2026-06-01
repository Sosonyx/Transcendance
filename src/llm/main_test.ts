// import * as readline from "readline";
// import dotenv from "dotenv";
// import type { RoomChatMessage } from "./types/messages.js";
// import { llmPersonnality } from "./personnality.js";
// import EventEmitter from "node:events";
// import { LlmController } from "./llmController.js";

// dotenv.config({ path: ".env" });

// const { pipeline } = await import("./pipeline.js");

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// function ask(question: string): Promise<string> {
//     return new Promise((resolve) => {
//         rl.question(question, (answer: string) => resolve(answer));
//     });
// }

// async function main() {
//     console.log("\x1b[47mllm-test -> tape 'exit' pour quitter\x1b[0m\n");

//     const emitter_test = new EventEmitter();
//     const llmController = new LlmController("room1", emitter_test, "", ["Alice", "Bob"], "TestLlm");

//     while (true) {
//         const userInput = await ask("\x1b[32mPlayer : \x1b[0m");

//         if (userInput === "exit") {
//             console.log("\x1b[31mBye !\x1b[0m");
//             rl.close();
//             break;
//         }
//         await pipeline(llmController.getLlmHistory(), userInput, llmController.getPersonnality());
//     }
// }

// main();
