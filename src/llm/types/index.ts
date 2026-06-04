import type { Message } from "./messages.js";

export interface LlmInterface {
    startPlaying(): void;
    stopPlaying(): void;

    setName(name: string): void;
    receiveUserMessage(message: Message): void;
    setGlobalQuestion(question: string): void;
    answerGlobalQuestion(responsesFromUsers: Message[]): Promise<void>;
    vote(): Promise<void>;
}
