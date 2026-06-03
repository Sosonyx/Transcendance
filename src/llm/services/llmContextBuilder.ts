import type { Message } from "../types/messages.js";

export class LlmContextBuilder {
	public getCutoffTime(): number {
		return Date.now() - 1500;
	}

	public collectMessagesToAnswer(messages: Message[], cutoff: number): Message[] {
		return messages.filter(message => message.timestamp <= cutoff);
	}

	public clearProcessedMessages(messages: Message[], cutoff: number): Message[] {
		return messages.filter(message => message.timestamp > cutoff);
	}

	public buildContext(messages: Message[], currentQuestion?: string): string {
		let messagesToSend;

        if (!currentQuestion)
            messagesToSend = messages;
        else
            messagesToSend = [...messages, { senderId: "system", content: currentQuestion, timestamp: Date.now() }];

		return messagesToSend.map(message => `${message.senderId}: ${message.content}`).join("\n");
	}
}