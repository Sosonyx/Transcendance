import * as readline from "readline";
import { callLLM } from "./llm.ts";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { buildSystemPrompt } from "./prompt.ts";
import type { GameState } from "./prompt.ts";
import { getSession } from "./context.ts";
import {router } from "./router.ts"


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string>
{
    return new Promise((resolve) => { rl.question(question, (answer) => resolve(answer));});
}

async function main() {
  console.log("llm-test -> tape 'exit' pour quitter\n");
  while (true)
    {
    const userInput = await ask("Player : ");

          if (userInput === "exit")
            {
              console.log("Bye !");
              rl.close();
              break;
            }
          else 
            router(userInput);
  }
}

main();