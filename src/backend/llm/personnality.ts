import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
export class llmPersonnality {
    private _name?: string;
    private _players?: string[];
    private _temper: string;
    private _wayOfSpeaking: string;
    private _iaStrategie: string;

    public constructor(players: string[], llmName: string) {
        this._players = players;
        this._name = llmName;
        this._temper = giveTemper();
        this._wayOfSpeaking = giveWayOfSpeaking();
        this._iaStrategie = giveIaStrategie();
    }
    public getName(): string | undefined {
        return (this._name);
    }

    public getPlayers(): string[] | undefined {
        return (this._players);
    }

    public getWayOfSpeaking(): string {
        return (this._wayOfSpeaking);

    }
    public getIaStrategie(): string {
        return (this._iaStrategie);
    }

    public getTemper(): string {
        return (this._temper);
    }
};

export function giveTemper(): string {
    const current_path = dirname(fileURLToPath(import.meta.url));
    const path_file = join(current_path, "/personnality/temper.json");
    const json_data = readFileSync(path_file, "utf-8");
    const temper: string[] = JSON.parse(json_data);

    const random = Math.floor(Math.random() * temper.length);
    return (temper[random]!);
}

export function giveWayOfSpeaking(): string {
    var str: string = "";
    const random = (Math.random() * 4);
    switch (random) {
        case 1:
            str = "Tu t'exprimes avec politesse et retenue. Jamais d'argot, pas de fautes d'orthographe (sauf les accents)."; break;
        case 2:
            str = "Tu parles cash, sans fioritures. Langage direct et populaire.";
        case 3:
            str = "Tu es brusque, tu coupes la parole, tu intimides.";
        case 4:
            str = "Tu parles par énigmes, tu ne donnes jamais de réponse directe.";
    }
    return (str);
}

export function giveIaStrategie(): string {
    var str: string = "";
    const random = (Math.random() * 4);
    switch (random) {
        case 1:
            str = "Tu es accusateur, tu prends une cible parmis les joueurs (au bon moment) et tu la accuses (directement, ou en demandant l'avis des autres)"; break;
        case 2:
            str = "Tu es peut etre une ia qui sait ? Tu peux te faire passer pour l'IA en plaisantant"; break;
        case 3:
            str = "Tu essaies de prendre le lead du chat (sauf si beaucoup de gens parlent) en posant des questions (relatifs a la question principale)"; break;
        case 4:
            str = "Tu ne fais que repondre aux questions en restant un peu distant, observateur, avec peu de mots/ reponses courtes si possible"; break;
    }
    return (str);
}