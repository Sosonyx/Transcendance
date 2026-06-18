import { systemPrompt } from "./prompt.js";
import { askClaude } from "./claude.js";
import type { llmHistory } from "./services/llmHistory.js";
import type { llmPersonnality } from "./personnality.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import type { GameAction } from "./claude.js"
import type { phase } from "./actions.js";

// "context" can either be the list of questions from users to the global question, 
// or the list of responses from users to the global question, 
// or the list of messages in the current conversation (when the LLM has to send a message or vote).
export async function pipeline(history: llmHistory, context: string,  personnality : llmPersonnality, phase: phase, globalQuestion?: string): Promise<GameAction> 
{
    const promptContext: string = systemPrompt(personnality, phase);
    const usersMessages: MessageParam[] = [...history.getMessagesHistory(), { role: 'user', content: context }];

    const action: GameAction = await askClaude(promptContext, usersMessages, phase);

    switch (action.type) {
        case "answer_global_question":
            history.addMessageAsUser(globalQuestion ?? context);
            history.addMessageAsAssistant(action.response);
            break;
        case "message":
            history.addMessageAsUser(context);
            history.addMessageAsAssistant(action.text);
            break;
        case "silent":
            console.log(`[SILENT] ${personnality.getName()} is silent because: ${action.reason}`);
            break;
        case "vote":
            console.log(`[VOTE] ${personnality.getName()} votes against ${action.target}`);
            break;
    }
    return action;
}