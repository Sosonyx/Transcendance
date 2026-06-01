import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import { llmHistory as llmHistory } from "./llmHistory.js";
import { llmPersonnality } from "./personnality.js";
import { LlmScheduler } from "./llmScheduler.js";
import type { Message } from "./types/messages.js";

export class Llm {
	private readonly	_roomEmitter: EventEmitter;

	private readonly	_nbPlayers: number;
	private				_lastMessages: Message[] = [];
	private 			_llmHistory: llmHistory;
	private             _currentQuestion: string | undefined;

	private				_llmPersonnality: llmPersonnality;
	private readonly	_scheduler: LlmScheduler;

	public constructor(roomEmitter: EventEmitter,
	playerNames: string[] = [], llmName: string) 
	{
		this._roomEmitter = roomEmitter;
		this._nbPlayers = playerNames.length;
		this._llmHistory = new llmHistory();
		this._llmPersonnality = new llmPersonnality(playerNames, llmName);
		this._scheduler = new LlmScheduler();
	}
	// To set when the room is in a state where the LLM should answer
	public startPlaying(): void {
		this._scheduler.start(() => { void this.llmAnswer(); });
	}

	public stopPlaying(): void {
		this._scheduler.stop();
	}

	private getCutoffTime(): number {
		return Date.now() - 1500;
	}

	private collectMessagesToAnswer(cutoff: number): Message[] {
		return this._lastMessages.filter(m => m.timestamp <= cutoff);
	}

	private clearProcessedMessages(cutoff: number): void {
		// Remove messages that were used, keeping only those that are newer than the cutoff (1.5s)
		this._lastMessages = this._lastMessages.filter(m => m.timestamp > cutoff);
	}

	private shouldSpontaneouslyAnswer(): boolean {
		const prob = Math.min(0.4, 1 / this._nbPlayers);

		return Math.random() < prob;
	}

	private	consumeGlobalQuestion(): string | undefined {
		// Consume the current question and reset it to undefined to avoid using the same question 
		// multiple times if the LLM takes a long time to answer.
		const currentQuestion = this._currentQuestion;
		this._currentQuestion = undefined;

		return currentQuestion;
	}

	private delayResponse(reply: string): void {
		let delay = 800 + reply.length * 10;
		delay = Math.min(delay, 2000);

		if (!this._scheduler.canEmit())
			return;
		setTimeout(() => {
			if (!this._scheduler.canEmit())
				return;

			const msg: Message = { senderId: this._llmPersonnality.getName() ?? 'Llm', content: reply, timestamp: Date.now() };
			this._roomEmitter.emit("message", msg);
		}, delay);
	}

	public	addMessage(message: Message): void {
		this._lastMessages.push(message);

		if (this._scheduler.canEmit())
			this._scheduler.scheduleNextTick(() => { void this.llmAnswer(); });
	}

	private async llmAnswer(): Promise<void> {
		if (!this._scheduler.tryBeginAnswering()) {
			if (this._scheduler.canEmit())
				this._scheduler.scheduleNextTick(() => { void this.llmAnswer(); });
			return;
		}

		// "Seuil" minimum
		const cutoff = this.getCutoffTime();

		try {
			const messagesUsedToAnswer = this.collectMessagesToAnswer(cutoff);

			if (!messagesUsedToAnswer.length) {
				// No recent user messages, decide whether the LLM should speak spontaneously
				if (!this.shouldSpontaneouslyAnswer()) {
					console.log("LLM decides not to answer spontaneously.");
					return;
				}
				// We need to create a "fake" message to trigger the pipeline
				const currQuestion = this.consumeGlobalQuestion();
				if (!currQuestion) {
					return;
				}
				messagesUsedToAnswer.push({ senderId: "system", content: currQuestion, timestamp: Date.now() });
			}
			// Clear the messages that are used to answer from the "object's buffer", keeping only the newer ones to be processed next tick
			this.clearProcessedMessages(cutoff);

			const reply = await pipeline(this._llmHistory, parseMessages(messagesUsedToAnswer), this._llmPersonnality);
			if (reply && this._scheduler.canEmit()) {
				this.delayResponse(reply);
			}				
		}
		catch (error) {
			console.error("Error in LLM pipeline:", error);
		}
		finally {
			this._scheduler.finishAnswering(() => {
				this._scheduler.scheduleNextTick(() => { void this.llmAnswer(); });
			});
		}
	}

	public setCurrentQuestion(question: string): void {
		this._currentQuestion = question;
	}
}

function parseMessages(messages: Message[]): string {
	return messages.map(m => `${m.senderId}: ${m.content}`).join("\n");
}
