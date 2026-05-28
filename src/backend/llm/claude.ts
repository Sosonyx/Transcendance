import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import { debugLLMResponse } from "./src/debug_llm.js";

import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv(): void {
    const candidatePaths = [
        resolve(__dirname, ".env"),
        resolve(__dirname, "../../../src/backend/llm/.env"),
        resolve(process.cwd(), "src/backend/llm/.env"),
        resolve(process.cwd(), ".env"),
    ];

    const envPath = candidatePaths.find((path) => existsSync(path));

    if (envPath)
        dotenv.config({ path: envPath });
    else
        dotenv.config();
}

loadEnv();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey)
    throw new Error("ANTHROPIC_API_KEY is not set");

const myClientAPI = new Anthropic({ apiKey });

function getSystemPrompt(myPromptStr : string) : Anthropic.Messages.TextBlockParam
{
    let SystemPromptBlock: Anthropic.Messages.TextBlockParam = 
    {
        type: "text",
        text: myPromptStr,
        cache_control: { type: "ephemeral" }
    };
    return (SystemPromptBlock);
}

export async function askClaude(myPromptStr: string, conversationHistory: MessageParam[]): Promise<string> {
    const llmResponse = await myClientAPI.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        temperature: 1.0,
        system: [getSystemPrompt(myPromptStr)], 
        messages: conversationHistory
    });

    // console.log("content complet:", JSON.stringify(llmResponse.content, null, 2));
    // const block = llmResponse.content[0];
    const block = llmResponse.content.find( b => b.type === "text")
    if(block === undefined || block.type !== "text")
    {
        debugLLMResponse(llmResponse);
        throw new Error("Unexpected response type");
    }
    return block.text;
}