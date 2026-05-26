import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config();

const client = new Groq({apiKey: process.env.GROQ_API_KEY});

export async function askGroq(message :string) : Promise<string>
{
    const response = await client.chat.completions.create({model: "llama-3.1-8b-instant",
        max_tokens: 100,
        temperature: 0.2,
        messages: [{role: "system",content: `ce message est il une question auquel un enfant peut repondre normalement reponds par oui ou non uniquement${message}`}]})

    return response.choices[0].message.content ?? "";
}