import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

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

function getSystemPrompt(promptContext : string) : Anthropic.Messages.TextBlockParam
{
    let SystemPromptBlock: Anthropic.Messages.TextBlockParam = 
    {
        type: "text",
        text: promptContext,
        cache_control: { type: "ephemeral" }
    };
    return (SystemPromptBlock);
}

export async function askClaude(promptContext: string, conversationHistory: MessageParam[]): Promise<string> {
    const llmResponse = await myClientAPI.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 150,
        temperature: 1.0,
        system: [getSystemPrompt(promptContext)], 
        messages: conversationHistory
    });
    const block = llmResponse.content.find( (b: Anthropic.Messages.ContentBlock) => b.type === "text")
    if(block === undefined || block.type !== "text")
    {
        throw new Error("Unexpected response type");
    }

    llmResponse.
    return block.text;
}

// claude-opus-4-7