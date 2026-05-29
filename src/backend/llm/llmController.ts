import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import { llmHistory as llmHistory } from "./llmHistory.js";
import { llmPersonnality } from "./personnality.js";
import type { Message } from "./types/messages.js";

export class LlmController {
	private readonly	_roomEmitter: EventEmitter;

	private readonly	_intervalMs: number;
	private readonly	_jitterMs: number;

	private readonly	_nbPlayers: number;
	private				_lastMessages: Message[] = [];
	private 			_llmHistory: llmHistory;
	private             _currentQuestion: string | undefined;

	private				_isPlaying = false;
	private				_isAnswering = false;
	private				_timer: NodeJS.Timeout | null = null;

	private				_llmPersonnality: llmPersonnality;

	public constructor(roomEmitter: EventEmitter,
	playerNames: string[] = [], llmName: string) 
	{
		this._roomEmitter = roomEmitter;
		this._nbPlayers = playerNames.length;
		this._intervalMs = 5000;
		this._jitterMs = 2000;
		this._llmHistory = new llmHistory();
		this._llmPersonnality = new llmPersonnality(playerNames, llmName);
	}
	// To set when the room is in a state where the LLM should answer
	public startPlaying(): void {
		if (this._isPlaying)
			return;
		this._isPlaying = true;

		this.scheduleNextTick();
	}

	public stopPlaying(): void {
		if (!this._isPlaying)
			return;

		this._isPlaying = false;
		this.clearTimer();
		this._timer = null;
	}

	private computeDelay(): number {
		if (this._jitterMs <= 0)
			return this._intervalMs;

		const jitter = Math.random() * this._jitterMs;
		const sign = Math.random() < 0.5 ? -1 : 1;

		return Math.round(this._intervalMs + sign * jitter);
	}

	private scheduleNextTick(): void {
		if (this._timer)
			return;

		this._timer = setTimeout(() => { void this.llmAnswer(); } ,this.computeDelay());
	}

	private	clearTimer(): void {
		if (!this._timer)
			return;

		clearTimeout(this._timer);
		this._timer = null;
	}

	private getCutoffTime(): number {
		return Date.now() - 1500;
	}

	private collectMessagesForAnswer(cutoff: number): Message[] {
		return this._lastMessages.filter(m => m.timestamp <= cutoff);
	}

	private clearProcessedMessages(cutoff: number): void {
		this._lastMessages = this._lastMessages.filter(m => m.timestamp > cutoff);
	}

	private shouldSpontaneouslyAnswer(): boolean {
		const prob = Math.min(0.4, 1 / this._nbPlayers);

		return Math.random() < prob;
	}

	private	consumeCurrentQuestion(): string | undefined {
		const currentQuestion = this._currentQuestion;
		this._currentQuestion = undefined;
		return currentQuestion;
	}

	private delayResponse(reply: string): void {
		let delay = 500 + reply.length * 10;
		delay = Math.min(delay, 2000);

		setTimeout(() => {
			const msg: Message = { senderId: this._llmPersonnality.getName() ?? 'Llm', content: reply, timestamp: Date.now() };
			this._roomEmitter.emit("message", msg);
		}, delay);
	}

	public	addMessage(message: Message): void {
		this._lastMessages.push(message);

		if (this._isPlaying)
			this.scheduleNextTick();
	}

	private async llmAnswer(): Promise<void> {
		this._timer = null;

		if (!this._isPlaying || this._isAnswering) {
			this.scheduleNextTick();
			return;
		}
		this._isAnswering = true;

		// "Seuil" minimum
		const cutoff = this.getCutoffTime();

		try {
			const messagesUsedToAnswer = this.collectMessagesForAnswer(cutoff);

			if (!messagesUsedToAnswer.length) {
				// No recent user messages, decide whether the LLM should speak spontaneously
				if (!this.shouldSpontaneouslyAnswer()) {
					console.log("LLM decides not to answer spontaneously.");
					this.scheduleNextTick();
					return;
				}
				const currQuestion = this.consumeCurrentQuestion();
				if (!currQuestion) {
					this.scheduleNextTick();
					return;
				}

				messagesUsedToAnswer.push({ senderId: "system", content: currQuestion, timestamp: Date.now() });
			}
			this.clearProcessedMessages(cutoff);

			const reply = await pipeline(this._llmHistory, parseMessages(messagesUsedToAnswer), this._llmPersonnality);
			if (reply && this._isPlaying) {
				// const msg: Message = { senderId: this._llmPersonnality.getName() ?? 'Llm', content: reply, timestamp: Date.now() };
				// this._roomEmitter.emit("message", msg);
				this.delayResponse(reply);
			}
		}
		catch (error) {
			console.error("Error in LLM pipeline:", error);
		}
		finally {
			this._isAnswering = false;
			this.scheduleNextTick();
		}
	}

	public setCurrentQuestion(question: string): void {
		this._currentQuestion = question;
	}
}

function parseMessages(messages: Message[]): string {
	return messages.map(m => `${m.senderId}: ${m.content}`).join("\n");
}
