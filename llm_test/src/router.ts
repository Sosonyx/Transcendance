import type { Router, Request, Response } from "express";
import { buildSystemPrompt } from "./prompt.ts";
import type { GameState } from "./prompt.ts";
import { blockBadPatterns } from "./guardrails_input.ts";
import * as readline from "readline";
import { callLLM } from "./llm.ts";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { getSession } from "./context.ts";





export async function router(userInput: string): Promise<T> {

    const llmPerso: GameState =
    {
        playerName: "player1",
        llmMood: "hostile",
    };

    const messages_array: Anthropic.MessageParam[] = [];

    const myPromptStr: string = buildSystemPrompt(llmPerso);
    const mySession = getSession("player1");
    let result: string;
    if (blockBadPatterns(userInput).blockedResult === true)
        return (console.log("secu\n"), 1);
    else
        // messages_array.push({ role: "user", content: userInput });
        mySession.addUserMessage(userInput, 'user');
    mySession.addUserMessage("answer test", 'assitant');

    const llmReply: string = await callLLM(myPromptStr, mySession.getMessage());
    // messages_array.push({ role: "assistant", content: llmReply });
    mySession.addUserMessage(llmReply, 'assistant');
    console.log(`\n${llmPerso.playerName} : ${llmReply}\n`);
    // console.log((`\n${llmPerso.playerName} : ${getSession("player1").toString()}`));
    return (0);
}