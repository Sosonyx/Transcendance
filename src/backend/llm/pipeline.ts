import { buildSystemPrompt } from "./prompt.js";
import type { LlmPersona } from "./prompt.js";
import { blockBadPatterns } from "./guardrails/input.js";
import { askClaude } from "./claude.js";
import { getOrCreateSession } from "./sessionStore.js";
import type { RoomChatMessages } from "./types/messages.js";

// Extends means that LlmRoomContext has all properties of LlmPersona, 
// plus the additional ones defined in LlmRoomContext
export interface LlmRoomContext extends LlmPersona
{
    playerId: string;
    gameRole: "human" | "llm"; // A  voir selon comment on stocke les datas dans ROOMplayer?
}

export interface PipelineInput
{
    llmPlayer: LlmRoomContext;
    chatHistory: RoomChatMessages[];
}

export async function pipeline(input: PipelineInput): Promise<string> 
{
    const myPromptStr: string = buildSystemPrompt(input.llmPlayer);

    const mySession = getOrCreateSession(input.llmPlayer.playerId);

    // We add the new messages to the session history, but we need to distinguish between user and assistant messages
    for (const message of input.chatHistory)
    {
        if (message.senderId === input.llmPlayer.playerId)
        {
            mySession.addMessageAsAssistant(message.content);
            continue;
        }

        if (blockBadPatterns(message.content).blockedResult === true)
        {
            console.log("Wrong input detected\n");
            continue;
        }

        mySession.addMessageAsUser(message.content);
    }

    const llmReply: string = await askClaude(myPromptStr, mySession.getMessageHistory());
    mySession.addMessageAsAssistant(llmReply);

    console.log(`\x1b[36m\n${input.llmPlayer.playerName} : ${llmReply}\n\x1b[0m`);
    return llmReply;
}
