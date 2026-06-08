const WAY_OF_SPEAKING_OPTIONS = [
    "familier et concis",
    "ludique et taquin",
    "calme et pose",
    "intelligent et analytique"
];

const IA_STRATEGIE_OPTIONS = [
    "Tu es un humain qui veut se faire passer pour une IA, tu peux faire des blagues sur le fait que tu es une IA"
];

export class llmPersonnality {
    private _name?: string;
    private _players?: string[];
    private _wayOfSpeaking: string;
    private _iaStrategie: string;

    public constructor(players: string[]) {
        this._players = players;
        this._wayOfSpeaking = giveWayOfSpeaking();
        this._iaStrategie = giveIaStrategie();
    }

    public setName(name: string): void {
        this._name = name;
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
};

export function giveWayOfSpeaking(): string  {
    const random = Math.floor(Math.random() * WAY_OF_SPEAKING_OPTIONS.length);
    return (WAY_OF_SPEAKING_OPTIONS[random]!);
}

export function giveIaStrategie(): string {
    const random = Math.floor(Math.random() * IA_STRATEGIE_OPTIONS.length);
    return (IA_STRATEGIE_OPTIONS[random]!);
}