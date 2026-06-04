import { systemPrompt } from "./prompt.js";
import { askClaude } from "./claude.js";
import type { llmHistory } from "./services/llmHistory.js";
import type { llmPersonnality } from "./personnality.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import type { GameAction } from "./claude.js"

export async function pipeline(history: llmHistory, lastMessages: string,  personnality : llmPersonnality): Promise<GameAction> 
{
    const promptContext: string = systemPrompt(personnality, lastMessages);
    const usersMessages: MessageParam[] = [...history.getMessagesHistory(), { role: 'user', content: lastMessages }];

    const action: GameAction = await askClaude(promptContext, usersMessages);

    history.addMessageAsUser(lastMessages);

    switch (action.type) {
        case "answer_global_question":
            history.addMessageAsAssistant(action.response);
            break;
        case "message":
            history.addMessageAsAssistant(action.text);
            break;
        case "silent":
            console.log(`[SILENT] ${action.reason}`);  
            history.addMessageAsAssistant(`[SILENT] ${action.reason}`);  
            break;
        case "vote":
            console.log(`[VOTE] ${personnality.getName()} votes against ${action.target}`);
            break;
        default:
            throw new Error("Action inconnue");
    }
    return action;
}
