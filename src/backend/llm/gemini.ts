import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const GEMI_API_KEY = process.env.GEMINI_API_KEY;
if(!GEMI_API_KEY)
    throw new Error("MISSING GEMINI API KEY");

const client = new GoogleGenAI({apiKey: GEMI_API_KEY});

export async function askGemini(message: string): Promise<string> {
    const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `ce message est il une question auquel un enfant peut repondre normalement reponds par oui ou non uniquement ${message}`,
    });

    return response.text ?? "";
}