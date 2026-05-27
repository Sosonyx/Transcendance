import { systemPrompt } from "./prompt.js";
import { blockBadPatterns } from "./guardrails/input.js";
import { askClaude } from "./claude.js";
import type { llmHistory } from "./llmHistory.js";
import type { llmPersonnality } from "./personnality.js";

// Extends means that LlmRoomContext has all properties of LlmPersona, 
// plus the additional ones defined in LlmRoomContext

export async function pipeline(history: llmHistory, lastMessages: string,  personnality : llmPersonnality): Promise<string> 
{
    const myPromptStr: string = systemPrompt(personnality, lastMessages);
    if (!blockBadPatterns(lastMessages).blockedResult === true)
            console.log('error in usr msg\n');
    const llmReply: string = await askClaude(myPromptStr, history.getMessageHistory());

    history.addMessageAsUser(lastMessages);
    history.addMessageAsAssistant(llmReply);

    return llmReply;
}
