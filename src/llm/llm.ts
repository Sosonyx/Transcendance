import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import type { LlmDecision } from "./pipeline.js";
import { LlmContextBuilder } from "./services/llmContextBuilder.js";
import { LlmDecisionEngine } from "./services/llmDecisionEngine.js";
import { llmHistory as llmHistory } from "./services/llmHistory.js";
import { llmPersonnality } from "./personnality.js";
import { LlmResponseEmitter } from "./services/llmResponseEmitter.js";
import { LlmScheduler } from "./services/llmScheduler.js";
import type { Message } from "./types/messages.js";

export class Llm {
	private				_lastMessages: Message[] = [];
	private 			_llmHistory: llmHistory;

	private				_llmPersonnality: llmPersonnality;
	private readonly	_scheduler: LlmScheduler;
	private readonly	_contextBuilder: LlmContextBuilder;
	private readonly	_decisionEngine: LlmDecisionEngine;
	private readonly	_responseEmitter: LlmResponseEmitter;

	public constructor(roomEmitter: EventEmitter,
	playerNames: string[] = [], llmName: string) 
	{
		this._llmHistory = new llmHistory();
		this._llmPersonnality = new llmPersonnality(playerNames, llmName);
		this._scheduler = new LlmScheduler();
		this._contextBuilder = new LlmContextBuilder();
		this._decisionEngine = new LlmDecisionEngine(playerNames.length);
		this._responseEmitter = new LlmResponseEmitter(roomEmitter, this._llmPersonnality);
	}
	// To set when the room is in a state where the LLM should answer
	public startPlaying(): void {
		this._scheduler.start(() => { void this.llmAnswer(); });
	}

	public stopPlaying(): void {
		this._scheduler.stop();
	}

	// To be able to know what is the current question in the room, so the LLM can decide to answer spontaneously about it.
	public setGlobalQuestion(question: string): void {
		this._decisionEngine.setGlobalQuestion(question);
	}
	
	public async answerGlobalQuestion(responsesFromUsers: Message[]): Promise<string> {
		const decision: LlmDecision = await pipeline(this._llmHistory, 
			this._contextBuilder.buildContext(responsesFromUsers), this._llmPersonnality);
		
		if (decision.shouldReply && decision.reply)
			return decision.reply;
		return "";
	}

	public	receiveUserMessage(message: Message): void {
		this._lastMessages.push(message);

		this._scheduler.scheduleNextTick(() => { void this.llmAnswer(); });
	}

	private handleNoRecentMessages(messagesRecentEnough: Message[]): Message[] | undefined {
		// No recent user messages, decide whether the LLM should speak spontaneously.
		if (!this._decisionEngine.shouldSpontaneouslyAnswer()) {
			console.log("LLM decides not to answer spontaneously.");
			return undefined;
		}

		// We need to create a "fake" message to trigger the pipeline.
		const currQuestion = this._decisionEngine.consumeGlobalQuestion();
		if (!currQuestion)
			return undefined;

		messagesRecentEnough.push({ senderId: "system", content: currQuestion, timestamp: Date.now() });
		return messagesRecentEnough;
	}

	private async handleAnswer(messagesRecentEnough: Message[], cutoff: number): Promise<void> {
		this._lastMessages = this._contextBuilder.clearProcessedMessages(this._lastMessages, cutoff);

		const decision: LlmDecision = await pipeline(this._llmHistory, this._contextBuilder.buildContext(messagesRecentEnough), this._llmPersonnality);
		console.log("LLM decision:", decision);
		console.log("LLM reply:", decision.reply);
			if (decision.shouldReply && decision.reply)
			this._responseEmitter.emit(decision.reply, () => this._scheduler.canEmit());	
	}

	private async llmAnswer(): Promise<void> {
		if (!this._scheduler.tryBeginAnswering()) 
		{
			this._scheduler.scheduleNextTick(() => { void this.llmAnswer(); });
			return;
		}

		const cutoff = this._contextBuilder.getCutoffTime();

		try {
			const messagesRecentEnough = this._contextBuilder.collectMessagesToAnswer(this._lastMessages, cutoff);

			if (!messagesRecentEnough.length) {
				const spontaneousMessages = this.handleNoRecentMessages(messagesRecentEnough);
				if (!spontaneousMessages)
					return;

				await this.handleAnswer(spontaneousMessages, cutoff);
				return;
			}
			await this.handleAnswer(messagesRecentEnough, cutoff);
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
}
