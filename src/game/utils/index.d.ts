import EventEmitter from "events";
export interface Message {
    senderId: string;
    content: string;
    timestamp: number;
}
export type RoomId = string | null;
export type VoteInfo = [id: string, name: string];
export interface RoomManagerInterface {
    connectPlayer(playerId: string, isTTY?: boolean): [roomId: string | null, room: EventEmitter, player: EventEmitter];
    onReadyEvent(playerId: string, roomId: RoomId, isTTY?: boolean): void;
    onInputEvent(playerId: string, roomId: RoomId, message: string, isTTY?: boolean): void;
    onChatEvent(playerId: string, roomId: RoomId, message: string, isTTY?: boolean): void;
    onVoteEvent(playerIdFrom: string, playerIdTo: string, roomId: RoomId, isTTY?: boolean): void;
    onDisconnectEvent(playerId: string, roomId: RoomId | null, isTTY?: boolean): void;
    onReplayEvent(playerId: string, roomId: RoomId, isTTY?: boolean): void;
    onSkipEvent(roomId: RoomId, isTTY: boolean): void;
    getVotePoolFromUser(roomId: RoomId, UserId: string): VoteInfo[] | null;
    getRoomState(roomId: RoomId): string | null;
}
export declare function shuffle<T>(array: T[]): T[];
//# sourceMappingURL=index.d.ts.map