import EventEmitter from "events";
// import type { roomStates } from "../game_logic/Room.js";

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
};

export type RoomId = string | null;

export interface RoomManagerInterface {
    connectPlayer(playerId : string, isTTY? : boolean) : [roomId : string | null, room : EventEmitter, player : EventEmitter]; // return RoomId + room as Emitter if new room
    onReadyEvent(playerId : string, roomId : RoomId, isTTY? : boolean) : void;
	onInputEvent(playerId : string, roomId : RoomId, message : string, isTTY? : boolean) : void;
    onChatEvent(playerId : string, roomId : RoomId, message : string, isTTY? : boolean) : void;
    onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : RoomId, isTTY? : boolean) : void;
	onDisconnectEvent(playerId : string, roomId : RoomId | null, isTTY? : boolean) : void;
	onReplayEvent(playerId : string, roomId : RoomId, isTTY? : boolean) : void;
	onSkipEvent(roomId: RoomId, isTTY : boolean) : void;
    getUsersIdFromRoomId(roomId : RoomId) : readonly  string[]; // return player UserId
	getRoomState(roomId : RoomId) : string | null;
};