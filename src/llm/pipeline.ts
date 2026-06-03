import { systemPrompt } from "./prompt.js";
import { askClaude } from "./claude.js";
import type { llmHistory } from "./services/llmHistory.js";
import type { llmPersonnality } from "./personnality.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

export interface LlmDecision {
    shouldReply: boolean;
    reply?: string | undefined;
}

function parseLlmDecision(rawDecision: string): LlmDecision { 
    const trimmedDecision = rawDecision.trim();

    try {
        const parsedDecision = JSON.parse(trimmedDecision) as Partial<LlmDecision>;

        if (typeof parsedDecision.shouldReply === "boolean") {
            return {
                shouldReply: parsedDecision.shouldReply,
                reply: (typeof parsedDecision.reply === "string") ? parsedDecision.reply : undefined
            };
        }
    }
    catch {
        throw new Error("Invalid LLM response format. Expected a JSON with 'shouldReply' boolean and optional 'reply' string.");
    }
    return {
        shouldReply: true,
        reply: trimmedDecision
    };
}

export async function pipeline(history: llmHistory, lastMessages: string,  personnality : llmPersonnality): Promise<LlmDecision> 
{
    const promptContext: string = systemPrompt(personnality, lastMessages);
    const usersMessages: MessageParam[] = [...history.getMessagesHistory(), { role: 'user', content: lastMessages }];

    const llmReply: string = await askClaude(promptContext, usersMessages);
    const decision = parseLlmDecision(llmReply);

    history.addMessageAsUser(lastMessages);
    history.addMessageAsAssistant(llmReply);

    return decision;
}
