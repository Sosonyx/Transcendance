import type { EventEmitter } from "stream";
import { pipeline } from "./pipeline.js";

export class Llm {
    private readonly _roomId: string;
    private readonly _roomEmitter: EventEmitter;
    private _isListening: boolean = false;
    private _isAction: boolean = false;

    private readonly interval: number = 5000; // intervalle de base entre les ticks
    private readonly jitter: number = 2000; // maximum de jitter à ajouter ou soustraire
    private _timer: NodeJS.Timeout | null = null;

    public constructor(roomId: string, roomEmitter: EventEmitter){
        this._roomId = roomId;
        this._roomEmitter = roomEmitter;
    }

    // **PUBLIC METHODS**
    public startListening()
    {
        if (this.isListening)
            return;
        this._isListening = true;
        this._roomEmitter.on('stateChanged', this.onStateChanged);
    }

    public stopListening()
    {
        this._isListening = false;
        this._roomEmitter.off('stateChanged', this.onStateChanged);
    }

    public get roomId(): string {
        return this._roomId;
    }
    public get isListening(): boolean {
        return this._isListening;
    }

    // **PRIVATE METHODS**
    private onStateChanged = (state: string) => 
    {
        this._isAction = (state === "ACTION");
        if (this._isAction)
            this.scheduleNextTick();
        else 
            this.clearTimer();
    };

    private computeDelay(): number 
    {
        if (this.jitter <= 0) 
            return this.interval;

        const jitter = Math.random() * this.jitter;
        const sign = Math.random() < 0.5 ? -1 : 1;

        return Math.round(this.interval + sign * jitter);
    }

    private scheduleNextTick() 
    {
        // si un timer est déjà en place, ne pas en créer un autre
        if (this._timer) 
            return;
        const delayBeforeLlmTalks = this.computeDelay();
        this._timer = setTimeout(() => this.nextTick(), delayBeforeLlmTalks);
    }

    private clearTimer() 
    {
        if (this._timer) 
        {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    private nextTick()
    {
        if (!this.isListening)
            return;
        
        
        this._timer = null;
        this.scheduleNextTick();
    }
}