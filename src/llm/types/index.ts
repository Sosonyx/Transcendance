import type { Message } from "./messages.js";
import type { playerInput } from "../llm.js";

export interface LlmInterface {
    startPlaying(): void;
    stopPlaying(): void;

    setName(name: string): void;
    receiveUserMessage(message: Message): void;

    askGlobalQuestion(questionsFromUsers: Message[]): Promise<playerInput>;
    answerGlobalQuestion(globalQuestion: string, responsesFromUsers: Message[]): Promise<void>;
    // setGlobalQuestion(question: string): void;
    vote(): Promise<void>;
}
