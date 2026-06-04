import { Player } from "./Player.js";
import { EventEmitter } from "node:events";
import type { VoteInfo } from "../utils/index.js";
export declare enum roomStates {
    INIT = "INIT",
    LOBBY = "LOBBY",
    ACTION_1 = "ACTION_1",
    ACTION_2 = "ACTION_2",
    CHAT = "CHAT",
    VOTE = "VOTE",
    RESULT = "RESULT",
    ERROR = "ERROR"
}
export type playerInput = {
    name: string;
    input: string;
};
export declare class Room extends EventEmitter {
    private readonly _id;
    private _gamemode;
    private _gameId?;
    private _number;
    private _state;
    private _players;
    private _inputs;
    private _input;
    private _playerCount;
    private _maxPlayerCount;
    private _isAccessible;
    private _timerId;
    private _llm;
    private _winCondition;
    private _createRoomInDB;
    private _createGameInDB;
    getId(): string;
    getNumber(): number;
    getPlayers(): Player[];
    getPlayerCount(): number;
    getMaxPlayerCount(): number;
    getState(): string;
    getIsAccessible(): boolean;
    getVotePoolFromPlayer(playerId: string): VoteInfo[];
    private _allPlayersShouldAct;
    stateSwitch(newState: roomStates): void;
    start(): void;
    onJoin(player: Player): Promise<void>;
    onReady(player: Player): void;
    onInput(player: Player, input: string): void;
    onChat(player: Player, message: string): void;
    onVote(playerFrom: Player, playerTo: Player): void;
    onReplay(player: Player): void;
    onSkip(): void;
    onDisconnect(player: Player): void;
    private _checkRestart;
    private _addLLMPLayer;
    private _removeLLMPlayers;
    private _restartRoom;
    private _computeResult;
    private _onReplayTimerEnded;
    private _checkVoteStatus;
    private _checkActionStatus;
    private _checkResultStatus;
    private _checkLobbyStatus;
    private _givePlayersName;
    accessPlayerByName(name: string): Player | undefined;
    accessPlayerById(id: string): Player | undefined;
    accessPlayerByUserId(id: string): Player | undefined;
    private _isLobbyReady;
    private _areAllPlayersReady;
    private _haveAllPlayersActed;
    private _doAllPlayersWannaReplay;
    private _pickAnInput;
    private __winConditionElimination;
    constructor(nb: number);
}
//# sourceMappingURL=Room.d.ts.map