import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import type { RoomChatMessages } from "./types/messages.js";
import { PrismaClient } from "./generated/client";

// function retrieveUserMessagesFromDb(): Promise<RoomChatMessages[]> 
// {
// 	prisma.
// }
// ``
export type LlmControllerOptions = {
	intervalMs?: number;
	jitterMs?: number;
	llmPlayerId?: string;
	llmPlayerName?: string;
	llmMood?: "hostile" | "neutral" | "friendly" | "observer" | "joker";
};

export class LlmController {
	private readonly roomId: string;
	private readonly roomEmitter: EventEmitter;

	private readonly intervalMs: number;
	private readonly jitterMs: number;
	private readonly llmPlayerId: string;
	private readonly llmPlayerName: string;
	private readonly llmMood: "hostile" | "neutral" | "friendly" | "observer" | "joker";

	private isListening = false;
	private roomIsInActionState = false;
	private isAnswering = false;
	private timer: NodeJS.Timeout | null = null;

	public constructor(roomId: string, roomEmitter: EventEmitter,
		options: LlmControllerOptions = {}) 
	{
		this.roomId = roomId;
		this.roomEmitter = roomEmitter;
		this.intervalMs = options.intervalMs ?? 5000;
		this.jitterMs = options.jitterMs ?? 2000;
		this.llmPlayerId = options.llmPlayerId ?? "llm-player";
		this.llmPlayerName = options.llmPlayerName ?? "llm";
		this.llmMood = options.llmMood ?? "neutral";
	}

	public startListening(): void 
    {
		if (this.isListening) 
			return;

		this.isListening = true;
		this.roomEmitter.on("stateChanged", this.onStateChanged);
	}

	public stopListening(): void 
    {
		if (!this.isListening) 
			return;

		this.isListening = false;
		this.roomEmitter.off("stateChanged", this.onStateChanged);
		this.clearTimer();
	}

	private onStateChanged = (state: string): void => 
    {
		this.roomIsInActionState = (state === "ACTION");

		if (this.roomIsInActionState) 
        {
			this.scheduleNextTick();
			return;
		}

		this.clearTimer();
	};

	private computeDelay(): number 
    {
		if (this.jitterMs <= 0)
			return this.intervalMs;

		const jitter = Math.random() * this.jitterMs;
		const sign = Math.random() < 0.5 ? -1 : 1;

		return Math.round(this.intervalMs + sign * jitter);
	}

	private scheduleNextTick(): void 
    {
		if (this.timer !== null || !this.isListening || !this.roomIsInActionState) 
			return;

		this.timer = setTimeout(() => {void this.nextTick();}
        , this.computeDelay());
	}

	private clearTimer(): void 
    {
		if (!this.timer)
			return;

		clearTimeout(this.timer);
		this.timer = null;
	}

	private async nextTick(): Promise<void> 
    {
		this.timer = null;

		if (!this.isListening || !this.roomIsInActionState || this.isAnswering) 
        {
			this.scheduleNextTick();
			return;
		}

		this.isAnswering = true;

		try {
			const chatHistory = await this.retrieveUserMessagesFromDb();
			const reply = await pipeline({
				llmPlayer: {
					playerId: this.llmPlayerId,
					playerName: this.llmPlayerName,
					llmMood: this.llmMood,
					gameRole: "llm"
				},
				chatHistory
			});

			this.roomEmitter.emit("message", {
				senderId: this.llmPlayerId,
				content: reply,
				timestamp: Date.now()
			});
		} 
        finally 
        {
			this.isAnswering = false;
			this.scheduleNextTick();
		}
	}

	private async retrieveUserMessagesFromDb(): Promise<RoomChatMessages[]> {
        
		return [];
	}
}