import type { EventEmitter } from "node:events";
import { pipeline } from "./pipeline.js";
import { LlmContextBuilder } from "./services/llmContextBuilder.js";
import { llmHistory as llmHistory } from "./services/llmHistory.js";
import { llmPersonnality } from "./personnality.js";
import { LlmResponseEmitter } from "./services/llmResponseEmitter.js";
import { LlmScheduler } from "./services/llmScheduler.js";
import type { Message } from "./types/messages.js";

// Duplicate type definition, should be moved to a common file
type playerInput =  { name : string, input : string};

export class Llm {
	private				_lastMessages: Message[] = [];
	private 			_llmHistory: llmHistory;
	private				_globalQuestion: string | undefined;

	private				_llmPersonnality: llmPersonnality;
	private readonly	_scheduler: LlmScheduler;
	private readonly	_contextBuilder: LlmContextBuilder;
	private readonly	_responseEmitter: LlmResponseEmitter;

	public constructor(roomEmitter: EventEmitter,
	playerNames: string[] = []) 
	{
		this._llmHistory = new llmHistory();
		this._llmPersonnality = new llmPersonnality(playerNames);
		this._scheduler = new LlmScheduler();
		this._contextBuilder = new LlmContextBuilder();
		this._responseEmitter = new LlmResponseEmitter(roomEmitter, this._llmPersonnality);
	}
	// To set when the room is in a state where the LLM should answer
	public startPlaying(): void {
		this._scheduler.start(() => { void this.llmChat(); });
	}

	public stopPlaying(): void {
		this._scheduler.stop();
	}

	public async askGlobalQuestion(questionsFromUsers: Message[]): Promise<playerInput> {
		const action = await pipeline(this._llmHistory, this._contextBuilder.buildContext(questionsFromUsers), this._llmPersonnality);
		if (action.type === "answer_global_question")
			return {name : this._llmPersonnality.getName() ?? "", input : action.response};
		else
			return {name : this._llmPersonnality.getName() ?? "", input : ""};			
	}

	public async answerGlobalQuestion(responsesFromUsers: Message[]): Promise<void> {
		this._lastMessages.push({ senderId: "system", content: `Global question: ${this._globalQuestion}`, timestamp: Date.now() });
		
		const action = await pipeline(this._llmHistory, this._contextBuilder.buildContext(responsesFromUsers), this._llmPersonnality);
		if (action.type === "answer_global_question")
			this._responseEmitter.emit(action.response, () => this._scheduler.canEmit());
	}

	public async vote(): Promise<void> {
		// TODO: I will need to pass a proper context
		const action = await pipeline(this._llmHistory, this._contextBuilder.buildContext([]), this._llmPersonnality);
		if (action.type === "vote")
			this._responseEmitter.emit(action.target, () => this._scheduler.canEmit());
	}

	public	receiveUserMessage(message: Message): void {
		this._lastMessages.push(message);

		this._scheduler.scheduleNextTick(() => { void this.llmChat(); });
	}

	private async llmChat(): Promise<void> {
		if (!this._scheduler.tryBeginAnswering()) 
		{
			this._scheduler.scheduleNextTick(() => { void this.llmChat(); });
			return;
		}

		try {
			const cutoff = this._contextBuilder.getCutoffTime();
			const messages = this._contextBuilder.collectMessagesToAnswer(this._lastMessages, cutoff);
			this._lastMessages = this._contextBuilder.clearProcessedMessages(this._lastMessages, cutoff);

			const action = await pipeline(this._llmHistory, this._contextBuilder.buildContext(messages), this._llmPersonnality);

			console.log("LLM action:", action);
			if (action.type === "message")
				this._responseEmitter.emit(action.text, () => this._scheduler.canEmit());
		} 
		catch (error) {
			console.error("Error in LLM pipeline:", error);
		} 
		finally {
			this._scheduler.finishAnswering(() => {
			this._scheduler.scheduleNextTick(() => { void this.llmChat(); });
			});
		}
	}

	public setName(name: string): void {
		this._llmPersonnality.setName(name);
	}

	public setGlobalQuestion(question: string): void {
		this._globalQuestion = question;
	}
}
