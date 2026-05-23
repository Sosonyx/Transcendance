import { ConversationContext } from "./context.js";

const playerSessions = new Map<string, ConversationContext>();

export function getOrCreateSession(playerId: string): ConversationContext 
{
    if (!playerSessions.has(playerId)) 
    {
        playerSessions.set(playerId, new ConversationContext());
    }

    return playerSessions.get(playerId)!;
}