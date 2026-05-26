import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import { debugLLMResponse } from "./src/debug_llm.js";


const myClientAPI = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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