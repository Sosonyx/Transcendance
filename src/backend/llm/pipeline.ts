import { systemPrompt } from "./prompt.js";
import { askClaude } from "./claude.js";
import type { llmHistory } from "./llmHistory.js";
import type { llmPersonnality } from "./personnality.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

export async function pipeline(history: llmHistory, lastMessages: string,  personnality : llmPersonnality): Promise<string> 
{
    const promptContext: string = systemPrompt(personnality, lastMessages);
    const usersMessages: MessageParam[] = [...history.getMessagesHistory(), { role: 'user', content: lastMessages }];

    const llmReply: string = await askClaude(promptContext, usersMessages);

    history.addMessageAsUser(lastMessages);
    history.addMessageAsAssistant(llmReply);

    return llmReply;
}
