import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import { error } from "node:console";
import dotenv from "dotenv";

dotenv.config();

const myClientAPI = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callLLM(myPromptStr: string, messages: MessageParam[]): Promise<string> {
    const llmResponse = await myClientAPI.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        temperature: 1.0,
        system: [
            {
                type: "text",
                text: myPromptStr,             // ← myPromptStr pas systemPrompt
                cache_control: { type: "ephemeral" }
            }
        ],
        messages
    });
    // console.log("content complet:", JSON.stringify(llmResponse.content, null, 2));
    // const block = llmResponse.content[0];
    const block = llmResponse.content.find( b => b.type === "text")
    if(block === undefined || block.type !== "text")
        throw new Error("Unexpected response type");
    return block.text;
}