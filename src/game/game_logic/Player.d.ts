import EventEmitter from "node:events";
export declare class Player extends EventEmitter {
    private _id;
    private _userId;
    private _name;
    private _isLLM;
    private _isReady;
    private _acted;
    private _wantReplay;
    private _voteAgainst;
    private _score;
    private _eliminated;
    getId(): string;
    getUserId(): string | null;
    getName(): string;
    getIsLLM(): boolean;
    isReady(): boolean;
    hasActed(): boolean;
    getWantReplay(): boolean;
    getVoteAgainst(): Player | null;
    getScore(): number;
    getEliminated(): boolean;
    incrementScore(value: number): void;
    switchReady(): void;
    reset(full?: boolean): void;
    setName(name: string): void;
    setActed(status: boolean): void;
    setWantReplay(status: boolean): void;
    setVoteAgainst(target: Player | null): void;
    setEliminated(status: boolean): void;
    constructor(userId: string | null, isLLM?: boolean);
}
//# sourceMappingURL=Player.d.ts.map