import EventEmitter from "events";
// import type { roomStates } from "../game_logic/Room.js";

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
};

export type RoomId = string | null;

export type VoteInfo = [userid : string | null, playerid : string, name : string, votes : number];

export enum gameMode {
	SCORE = "SCORE",
	ELIMINATION = "ELIMINATION"
};

export interface SafeUser {
    id: string;
    username: string;
    avatar: string;
};

export interface RoomManagerInterface {
    connectPlayer(user : SafeUser, gamemode : gameMode) : [roomId : string | null, room : EventEmitter, player : EventEmitter, ingame : boolean]; // return RoomId + room as Emitter if new room
    onReadyEvent(playerId : string, roomId : RoomId) : void;
	onInputEvent(playerId : string, roomId : RoomId, message : string) : void;
    onChatEvent(playerId : string, roomId : RoomId, message : string) : void;
    onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : RoomId) : void;
	onDisconnectEvent(playerId : string, roomId : RoomId | null) : void;
	onReplayEvent(playerId : string, roomId : RoomId) : void;
	onSkipEvent(roomId: RoomId, isTTY : boolean) : void;
    // getUsersIdFromRoomId(roomId : RoomId) : readonly  string[]; // return player UserId
	// getVotePoolFromUser(roomId : RoomId, UserId : string) : VoteInfo[] | null;
	getRoomState(roomId : RoomId) : string | null;
};


// export interface GameConfig {
// 	_gamemode : gameMode | null;
// 	_maxPlayerCount : number;
// 	_action_1_Time : number;
// 	_action_2_Time : number;
// 	_chatTime : number = 60 * 1000; // 30 seconds
// 	_voteTime : number = 30 * 1000; // 30 seconds
// 	_replayTime : number = 30 * 1000; // 30 seconds
// 	_maxPlayerCount : number = 7;
// 	_scoreCorrectVote : number = 3;
// 	_scoreGetVoted : number = 1;
// 	_scoreObjective : number = 10;
// 	_eliminationTreshold : number = 1;
// }

export interface LobbyInfo {
	_mode : gameMode | null,
	_llmCount : number,
	_players : [login : string, readyness : boolean][],
	_spots : number
};

export interface ScoreInfo {
	_alive : [login : string, score : number | null][],
	_eliminated : [login : string][]
};

export interface VoteResultInfo {
	_players : [login : string, name : string, _llm : boolean]
}

// implementation found online
// https://stackoverflow.com/questions/48083353/i-want-to-know-how-to-shuffle-an-array-in-typescript
// with minor fix
export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]]  = [
        array[randomIndex]!, array[currentIndex]!];
    }
  
    return array;
};