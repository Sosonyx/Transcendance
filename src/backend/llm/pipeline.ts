import { buildSystemPrompt } from "./prompt.js";
import type { GameState } from "./prompt.js";
import { blockBadPatterns } from "../guardrails/input.js";
import { callLLM } from "../guardrails/llm.js";
import { getSession } from "../guardrails/context.js";

export async function pipeline(userInput: string): Promise<number> {
    const llmPerso: GameState =
    {
        playerName: "player1",
        llmMood: "hostile",
    };
    const myPromptStr: string = buildSystemPrompt(llmPerso);
    const mySession = getSession("player1");
    if (blockBadPatterns(userInput).blockedResult === true)
        return (console.log("secu\n"), 1);
    else
        mySession.addUserMessage(userInput, 'user');
    mySession.addUserMessage("answer test", 'assitant');

    const llmReply: string = await callLLM(myPromptStr, mySession.getMessage());
    mySession.addUserMessage(llmReply, 'assistant');
    console.log(`\n${llmPerso.playerName} : ${llmReply}\n`);
    return (0);
}