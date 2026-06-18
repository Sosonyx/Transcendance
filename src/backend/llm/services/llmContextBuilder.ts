import type { Message } from "../types/messages.js";

export class LlmContextBuilder {
	public getCutoffTime(): number {
		return Date.now() - 1500;
	}
	// We collect all the messages until the cutoff time (to avoid answering to messages that are too recent)
	public collectMessagesToAnswer(messages: Message[], cutoff: number): Message[] {
		return messages.filter(message => message.timestamp <= cutoff);
	}

	public clearProcessedMessages(messages: Message[], cutoff: number): Message[] {
		return messages.filter(message => message.timestamp > cutoff);
	}

	public buildContext(messages: Message[]): string {
		if (messages.length === 0)
			return "No messages yet, sometimes you might have to spontaneously respond";

		return messages.map(message => `${message.senderId}: ${message.content}`).join("\n");
	}
}