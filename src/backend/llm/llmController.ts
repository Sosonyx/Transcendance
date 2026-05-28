import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import { llmHistory as llmHistory } from "./llmHistory.js";
import { llmPersonnality } from "./personnality.js";
import type { Message } from "./types/messages.js";

export type timerOptions = {
	intervalMs?: number;
	jitterMs?: number;
};

export class LlmController {
	private readonly	_roomId: string;
	private readonly	_roomEmitter: EventEmitter;

	private readonly	_intervalMs: number;
	private readonly	_jitterMs: number;

	private readonly	_lastMessages: Message[] = [];
	private 			_llmHistory: llmHistory;

	private				_isListening = false;
	private				_roomIsInActionState = false;
	private				_isAnswering = false;
	private				_timer: NodeJS.Timeout | null = null;

	private				_llmPersonnality: llmPersonnality;

	public constructor(roomId: string, roomEmitter: EventEmitter, options: timerOptions = {},
	playerNames: string[] = [], llmName: string) 
	{
		this._roomId = roomId;
		this._roomEmitter = roomEmitter;
		this._intervalMs = options.intervalMs ?? 5000;
		this._jitterMs = options.jitterMs ?? 2000;
		this._llmHistory = new llmHistory();
		this._llmPersonnality = new llmPersonnality(playerNames, llmName);
		console.log(`LlmController for room ${roomId} initialized with interval ${this._intervalMs}ms and jitter ${this._jitterMs}ms.`);
	}

	private onStateChanged = (state: string): void => {
		this._roomIsInActionState = (state === "CHAT");

		if (this._roomIsInActionState) {
			this.scheduleNextTick();
			return;
		}
		this.clearTimer();
	};

	public startListening(): void {
		if (this._isListening)
			return;

		this._isListening = true;
		this._roomEmitter.on("stateChanged", this.onStateChanged);
	}

	public stopListening(): void {
		if (!this._isListening)
			return;

		this._isListening = false;
		this._roomEmitter.off("stateChanged", this.onStateChanged);
		this.clearTimer();
	}

	private computeDelay(): number {
		if (this._jitterMs <= 0)
			return this._intervalMs;

		const jitter = Math.random() * this._jitterMs;
		const sign = Math.random() < 0.5 ? -1 : 1;

		return Math.round(this._intervalMs + sign * jitter);
	}

	private scheduleNextTick(): void {
		if (this._timer !== null || !this._isListening || !this._roomIsInActionState)
			return;

		this._timer = setTimeout(() => { void this.nextTick(); }
			, this.computeDelay());
	}

	private clearTimer(): void {
		if (!this._timer)
			return;

		clearTimeout(this._timer);
		this._timer = null;
	}

	public notifyLlm(message: Message): void {
		if (message.senderId === this._llmPersonnality.getName())
			return;

		this._lastMessages.push(message);

		if (this._isListening && this._roomIsInActionState)
			this.scheduleNextTick();
	}

	private async nextTick(): Promise<void> {
		this._timer = null;

		if (!this._isListening || !this._roomIsInActionState || this._isAnswering) {
			this.scheduleNextTick();
			return;
		}

		this._isAnswering = true;

		try {
			const toProcess = [...this._lastMessages];
			this._lastMessages.length = 0;

			if (toProcess.length > 0) 
			{
				let reply = await pipeline(this.getLlmHistory(), parseMessages(toProcess), this.getPersonnality());
				if (reply)
				{
					const msg: Message = { senderId: this._llmPersonnality.getName() ?? `Llm`, content: reply, timestamp: Date.now() };
					this._roomEmitter.emit("message", msg);
					console.log(`LlmController: emitted message: ${JSON.stringify(msg)}`);
				}
			}
		}
		finally {
			this._isAnswering = false;
			this.scheduleNextTick();
		}
	}
	public getPersonnality(): llmPersonnality {
		return (this._llmPersonnality);
	}
	public getLlmHistory(): llmHistory {
		return (this._llmHistory);
	}
	public getRoomId(): string {
		return (this._roomId);
	}
}

function parseMessages(messages: Message[]): string {
	return messages.map(m => `${m.senderId}: ${m.content}`).join("\n");
}
