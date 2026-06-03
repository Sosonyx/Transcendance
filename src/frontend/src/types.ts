export enum roomStates {
	INIT = "INIT",
	LOBBY = "LOBBY",
	ACTION_1 = "ACTION_1",
	ACTION_2 = "ACTION_2",
	CHAT = "CHAT",
	VOTE = "VOTE",
	RESULT = "RESULT",
	ERROR = "ERROR"
}

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
}

export type VoteInfo = [id : string, name : string]