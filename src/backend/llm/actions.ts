import type { Tool } from "@anthropic-ai/sdk/resources/messages";

const askGlobalQuestionTool: Tool = {
        name: "ask_global_question",
        description:    "Pose une question globale à tous les joueurs.\
                        Tu dois formuler une question qui sera posée peut-etre à tous les joueurs, tu ne dois absolument jamais montrer que tu as connaissance\
                        des questions des autres joueurs mais simplement t'inspirer de leur langage.",
        input_schema: { 
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "La question globale à poser à tous les joueurs, une fois au début de la partie.",
                },
            },
            required: ["content"],
        },
};

const answerGlobalQuestionTool: Tool = {
        name: "answer_global_question",
        description: "Répond à la question globale posée par le jeu. \
        Utilise cet outil pour répondre à une question posée à tous les joueurs, avant la phase de discussion, tu ne dois utiliser cet outil qu'une seule fois, la toute premiere fois. Tu vas \
        recevoir les questions posées par les joueurs pour pouvoir adapter ton language, mais tu ne dois pas les utiliser pour formuler ta question.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "La réponse a la question globale posée par un des joueurs, ou toi même lors de la phase de reponse a la question globale, une fois.",
                },
            },
            required: ["content"],
        },
};

const messageTool: Tool = {
        name: "send_message",
        description: "Envoie un message dans le chat du jeu. Utilise cet outil quand tu veux parler, attention a bien respecter le prompt absolument.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "Le message à poster dans le chat",
                },
            },
            required: ["content"],
        },
};

const staySilentTool: Tool = {
        name: "stay_silent",
        description: "Ne rien dire ce tour. Utilise cet outil quand parler serait suspect ou inutile.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "Pourquoi tu choisis de te taire (jamais visible par les joueurs)",
                },
            },
            required: ["content"],
        },
};

const voteTool: Tool = {
        name: "cast_vote",
        description: "Voter pour éliminer un joueur. Uniquement pendant la phase de vote.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "Le nom du joueur contre qui tu votes",
                },
            },
            required: ["content"],
        },
};

export type phase = "askGlobalQuestion" | "answerGlobalQuestion" | "chat" | "vote";

// Mapping the phases of the games to the tools that the LLM can use during each phase
export const tools: Record<phase, Tool[]> = {
    askGlobalQuestion:      [askGlobalQuestionTool],
    answerGlobalQuestion:   [answerGlobalQuestionTool],
    chat:                   [messageTool, staySilentTool],
    vote:                   [voteTool],
};