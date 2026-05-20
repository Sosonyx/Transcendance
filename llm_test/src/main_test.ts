import * as readline from "readline";
import { callLLM } from "./llm.ts";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { buildSystemPrompt } from "./prompt.ts";
import type { GameState } from "./prompt.ts";
import { getSession } from "./context.ts";


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

  const llmPerso: GameState = 
  {
      playerName: "player1",
      llmMood: "hostile",
  };

  const messages_array: Anthropic.MessageParam[] = [];

  const myPromptStr : string = buildSystemPrompt(llmPerso);
  const mySession = getSession("player1");
  while (true)
    {
    const userInput = await ask("Player : ");

          if (userInput === "exit")
            {
              console.log("Bye !");
              rl.close();
              break;
            }
    // messages_array.push({ role: "user", content: userInput });
    mySession.addUserMessage(userInput, 'user');
    mySession.addUserMessage("answer test", 'assitant');

    const llmReply : string = await callLLM(myPromptStr, mySession.getMessage());
    // messages_array.push({ role: "assistant", content: llmReply });
    mySession.addUserMessage(llmReply, 'assistant');
    console.log(`\n${llmPerso.playerName} : ${llmReply}\n`);
    // console.log((`\n${llmPerso.playerName} : ${getSession("player1").toString()}`));
  }
}

main();