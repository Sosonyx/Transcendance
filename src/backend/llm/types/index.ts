import type { Message } from "./messages.js";
// import type { llmPersonnality } from "../personnality.js";
// import type { llmHistory } from "../llmHistory.js";

export interface LlmControllerInterface {
    startPlaying(): void;
    stopPlaying(): void;

    // getPersonnality(): llmPersonnality;
    // getLlmHistory(): llmHistory;
    // getRoomId(): string;
    
    addMessage(message: Message): void;
    setCurrentQuestion(question: string): void;
    // resetHistory(): void;
}
