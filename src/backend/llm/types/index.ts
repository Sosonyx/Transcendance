import type { Message } from "./messages.js";

export interface LlmInterface {
    startPlaying(): void;
    stopPlaying(): void;
    addMessage(message: Message): void;
    // To set the global question of the room
    setCurrentQuestion(question: string): void;
}
