import EventEmitter from "events";

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
};

export interface RoomManagerInterface {
    connectPlayer(playerId : string, isTTY? : boolean) : [string, EventEmitter]; // return RoomId + room as Emitter if new room
    onReadyEvent(playerId : string, roomId : string, isTTY? : boolean) : void;
    onChatEvent(playerId : string, roomId : string, message : string, isTTY? : boolean) : void;
    onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : string, isTTY? : boolean) : void;
    getPlayersIdFromRoomId(roomId : string) : readonly  string[]; // return playersId
};

export enum roomStates {
    INIT = "INIT",
    LOBBY = "LOBBY",
    ACTION = "ACTION",
    VOTE = "VOTE",
    RESULT = "RESULT",
    ERROR = "ERROR"
};
