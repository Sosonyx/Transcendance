import type { Router, Request, Response } from "express";
import type { buildSystemPrompt, GameState } from "./prompt.ts";
import type { getSession } from "./context.ts";
import type { callLLM } from "./llm.ts";
import { blockBadPatterns } from "./guardrails_input.js";


export function router(userMessage : string) : string | null
{
    let result : string;
    if (blockBadPatterns(userMessage))
            return (console.log("secu\n"), null);
    else 
        
    return (result)
}