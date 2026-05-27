import EventEmitter from "node:events";
import { ConversationContext } from "./context.js";
import { giveSystemPrompt } from "./prompt.js";
import { PrismaClient } from "@prisma/client";

export class llmPersonnality {
    private _emitter: EventEmitter;
    private _coversationHistory: ConversationContext;
    private _roomId: string;
    private _llmName?: string;
    private _otherPlayers?: string;
    private _personnality: string;
    private _wayOfSpeaking: string;
    private _iaStrategie: string;
    private _fullprompt: string;

    public constructor(roomId: string, emitter: EventEmitter) {
        this._emitter = emitter;
        this._roomId = roomId;
        this._coversationHistory = new ConversationContext();
        
        this._personnality = givePersonnality();
        this._wayOfSpeaking = giveWayOfSpeaking();
        this._iaStrategie = giveIaStrategie();
        this._fullprompt = giveSystemPrompt(this._llmName, this._personnality, this._wayOfSpeaking , this._iaStrategie)
        
    }

    public get roomId(): string {
        return this._roomId;
    }
    public giveRoomContent(roomId : string)


















































































































































































    {
        
    }

};


export function giveRoomContent(roomId : string): string
{
    const LlmName : string 
    return ("");
}


export function givePersonnality(): string
{
    var str : string = "";
    const random = (Math.random() * 4);
    switch(random)
    {
        case 1:
            str = "tu t'enerves tres vite.";
        case 2:
            str = "tres calme";
        case 3:
            str = "hyper sympa";
        case 4:
            str = "completent decaler";
    }
    return (str);
}

export function giveWayOfSpeaking(): string
{
    var str : string = "";
    const random = (Math.random() * 4);
    switch(random)
    {
        case 1:
            str = "Tu t'exprimes avec politesse et retenue. Jamais d'argot.";
        case 2:
            str = "Tu parles cash, sans fioritures. Langage direct et populaire.";
        case 3:
            str = "Tu es brusque, tu coupes la parole, tu intimides.";
        case 4:
            str = "Tu parles par énigmes, tu ne donnes jamais de réponse directe.";
    }
    return (str);
}


export function giveIaStrategie(): string
{
    var str : string = "";
    const random = (Math.random() * 4);
    switch(random)
    {
        case 1:
            str = "Tu n'es pas une ia tu le prend mal qu'on te le dise ";
        case 2:
            str = "Tu es peut etre une ia qui sait ?";
        case 3:
            str = "Tu es un humain qui se fait passer pour une ia";
        case 4:
            str = "tu ne sais pas trop";
    }
    return (str);
}