import EventEmitter from "events";
// import type { roomStates } from "../game_logic/Room.js";

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
};

export type RoomId = string | null;

export type VoteInfo = [id : string, name : string]

export interface RoomManagerInterface {
    connectPlayer(playerId : string, isTTY? : boolean) : [roomId : string | null, room : EventEmitter, player : EventEmitter]; // return RoomId + room as Emitter if new room
    onReadyEvent(playerId : string, roomId : RoomId, isTTY? : boolean) : void;
	onInputEvent(playerId : string, roomId : RoomId, message : string, isTTY? : boolean) : void;
    onChatEvent(playerId : string, roomId : RoomId, message : string, isTTY? : boolean) : void;
    onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : RoomId, isTTY? : boolean) : void;
	onDisconnectEvent(playerId : string, roomId : RoomId | null, isTTY? : boolean) : void;
	onReplayEvent(playerId : string, roomId : RoomId, isTTY? : boolean) : void;
	onSkipEvent(roomId: RoomId, isTTY : boolean) : void;
    // getUsersIdFromRoomId(roomId : RoomId) : readonly  string[]; // return player UserId
	getVotePoolFromUser(roomId : RoomId, UserId : string) : VoteInfo[] | null;
	getRoomState(roomId : RoomId) : string | null;
};

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