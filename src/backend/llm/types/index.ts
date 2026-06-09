import type { Message } from "./messages.js";
import type { playerInput } from "../llm.js";

export interface LlmInterface {
    startPlaying(): void;
    stopPlaying(): void;

    setName(name: string): void;
    receiveUserMessage(message: Message): void;
	clearHistory() : void;

    askGlobalQuestion(questionsFromUsers: Message[]): Promise<playerInput>;
    answerGlobalQuestion(globalQuestion: string, responsesFromUsers: Message[]): Promise<playerInput>;
    vote(): Promise<void>;
}
