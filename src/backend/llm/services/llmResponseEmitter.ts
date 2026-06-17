import type { EventEmitter } from "node:events";
import type { llmPersonnality } from "../personnality.js";
import type { Message } from "../types/messages.js";

export class LlmResponseEmitter {
	private readonly	_roomEmitter: EventEmitter;
	private readonly	_llmPersonnality: llmPersonnality;

	public constructor(roomEmitter: EventEmitter, llmPersonnality: llmPersonnality) {
		this._roomEmitter = roomEmitter;
		this._llmPersonnality = llmPersonnality;
	}

	// We need "canEmit()" because we have to check again before emitting
	public emit(reply: string, canEmit: () => boolean): void {
		let delay = 1000 + reply.length * 100;
		delay = Math.min(delay, 2000);

		if (!canEmit())
			return;

		setTimeout(() => {
			if (!canEmit())
				return;

			const msg: Message = {
				senderId: this._llmPersonnality.getName() ?? "Llm",
				content: reply,
				timestamp: Date.now()
			};

			this._roomEmitter.emit("message", msg, this._llmPersonnality.getColor());
		}, delay);
	}
}
