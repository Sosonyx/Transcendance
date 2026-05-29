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

export function giveWayOfSpeaking(): string  {
    const current_path = dirname(fileURLToPath(import.meta.url));
    const path_file = join(current_path, "/personnality/wayOfSpeaking.json");
    const json_data = readFileSync(path_file, "utf-8");
    const wayOfSpeaking: string[] = JSON.parse(json_data);

    const random = Math.floor(Math.random() * wayOfSpeaking.length);
    return (wayOfSpeaking[random]!);
}

export function giveIaStrategie(): string {
    const current_path = dirname(fileURLToPath(import.meta.url));
    const path_file = join(current_path, "/personnality/personnalities.json");
    const json_data = readFileSync(path_file, "utf-8");
    const iaStrategie: string[] = JSON.parse(json_data);

    const random = Math.floor(Math.random() * iaStrategie.length);
    return (iaStrategie[random]!);
}