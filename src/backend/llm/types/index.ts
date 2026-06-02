import type { Message } from "./messages.js";

export interface LlmInterface {
    startPlaying(): void;
    stopPlaying(): void;
    receiveUserMessage(message: Message): void;
    // To set the global question of the room
    setGlobalQuestion(question: string): void;
    answerGlobalQuestion(responsesFromUsers: Message[]): Promise<string | undefined>;
}
