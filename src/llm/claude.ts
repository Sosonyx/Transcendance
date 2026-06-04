import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv(): void {
    const candidatePaths = [
        resolve(__dirname, ".env"),
        resolve(__dirname, "../../../src/backend/llm/.env"),
        resolve(process.cwd(), "src/backend/llm/.env"),
        resolve(process.cwd(), ".env"),
    ];

    const envPath = candidatePaths.find((path) => existsSync(path));

    if (envPath)
        dotenv.config({ path: envPath });
    else
        dotenv.config();
}

loadEnv();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey)
    throw new Error("ANTHROPIC_API_KEY is not set");

const myClientAPI = new Anthropic({ apiKey });

function getSystemPrompt(promptContext : string) : Anthropic.Messages.TextBlockParam
{
    let SystemPromptBlock: Anthropic.Messages.TextBlockParam = 
    {
        type: "text",
        text: promptContext,
        cache_control: { type: "ephemeral" }    
    };
    return (SystemPromptBlock);
}

const tools: Anthropic.Tool[] = [
    {
        name: "answer_global_question",
        description: "Répond à la question globale posée par le jeu. \
        Utilise cet outil pour répondre à une question posée à tous les joueurs, avant la phase de discussion, tu ne dois utiliser cet outil qu'une seule fois, la toute premiere fois. Tu vas \
        recevoir les questions posées par les joueurs pour pouvoir adapter ton language, mais tu ne dois pas les utiliser pour formuler ta question.",
        input_schema: {
            type: "object",
            properties: {
                content: {
                    type: "string",
                    description: "La réponse a la question globale posée par un des joueurs lors de la phase de reponse a la question globale.",
                },
            },
            required: ["content"],
        },
    },
    {
        name: "send_message",
        description: "Envoie un message dans le chat du jeu. Utilise cet outil quand tu veux parler.",
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
    },
    {
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
    },
    {
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
    },
];

export type GameAction = 
    | { type: "answer_global_question"; response: string }
    | { type: "message"; text: string }
    | { type: "silent"; reason: string }
    | { type: "vote"; target: string };

function extractAction(res: Anthropic.Message): GameAction {
    const block = res.content.find((b): b is Anthropic.ToolUseBlock => (b.type === "tool_use"));
    if (!block)
        throw new Error("Aucun outil appelé");

    // We determine the action type based on the tool name, and extract the relevant information from the tool's input.
    let input = block.input as { content: string };
    switch (block.name) {
        case "answer_global_question":
            return { type: "answer_global_question", response: input.content };
        case "send_message":
            return { type: "message", text: input.content };
        case "stay_silent":
            return { type: "silent", reason: input.content };
        case "cast_vote":
            return { type: "vote", target: input.content };
        default:
            throw new Error(`Outil inconnu: ${block.name}`);
    }
}

export async function askClaude(promptContext: string, conversationHistory: MessageParam[]): Promise<GameAction> {
    const llmResponse = await myClientAPI.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 150,
        temperature: 1.0,
        system: [getSystemPrompt(promptContext)], 
        messages: conversationHistory,
        tool_choice: {type: "any" },
        tools

    });
    return extractAction(llmResponse);
}
