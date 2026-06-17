import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

import { tools } from "./actions.js";
import type { phase } from "./actions.js";

const apiKey = process.env.ANTHROPIC_API_KEY;
// if (!apiKey)
//     throw new Error("ANTHROPIC_API_KEY is not set");

const myClientAPI = apiKey  ? new Anthropic({ apiKey, maxRetries: 2, timeout: 10000 }) 
                            : null;

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

export type GameAction = 
    | { type: "ask_global_question"; question: string } 
    | { type: "answer_global_question"; response: string }
    | { type: "message"; text: string }
    | { type: "silent"; reason: string }
    | { type: "vote"; target: string };

function extractAction(res: Anthropic.Message): GameAction {
    const block = res.content.find((b): b is Anthropic.ToolUseBlock => (b.type === "tool_use"));
    if (!block)
        throw new Error("Aucun outil appelé");

    // We determine the action type based on the tool name, and extract the relevant information from the tool's input.
    let input = block.input as { content: string };
    switch (block.name) {
        case "ask_global_question":
            return { type: "ask_global_question", question: input.content };
        case "answer_global_question":
            return { type: "answer_global_question", response: input.content };
        case "send_message":
            return { type: "message", text: input.content };
        case "stay_silent":
            return { type: "silent", reason: input.content };
        case "cast_vote":
            return { type: "vote", target: input.content };
        default:
            throw new Error(`Outil inconnu: ${block.name}`);
    }
}

// Just a basic fallback action in case of an error.
function fallbackAction(_phase: phase): GameAction {
    return { type: "silent", reason: "Check if you have set the ANTHROPIC_API_KEY environment variable or if the API key is valid." };
}

export async function askClaude(promptContext: string, conversationHistory: MessageParam[], phase: phase): Promise<GameAction> {
    if (!myClientAPI) {
        console.error("ANTHROPIC_API_KEY is not set. Returning fallback action.");
        return fallbackAction(phase);
    }
    try {
        const llmResponse = await myClientAPI.messages.create({
            model: "claude-haiku-4-5-20251001",
            // model: "claude-opus-4-8",
            max_tokens: 150,
            temperature: 1.0,
            system: [getSystemPrompt(promptContext)],
            messages: conversationHistory,
            tool_choice: {type: "any" },
            tools: tools[phase]});

        return extractAction(llmResponse);
    }
    catch (error) {
        return fallbackAction(phase);
    }
}
// model: "claude-opus-4-8",
// model: "claude-opus-4-7"
// model: "claude-haiku-4-5-20251001",