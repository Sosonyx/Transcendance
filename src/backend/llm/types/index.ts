import type { Message } from "./messages.js";

export interface LlmControllerInterface {
    startPlaying(): void;
    stopPlaying(): void;
    addMessage(message: Message): void;
    setCurrentQuestion(question: string): void;
}
