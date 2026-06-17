const WAY_OF_SPEAKING_OPTIONS = [
    "familier et concis",
    "ludique et taquin",
    "intelligent et analytique",
    "neutre"
];

const IA_STRATEGIE_OPTIONS = [
    "Tu es observateur, tu ne reponds que quand c'est necessaire, tu laisses les autres se griller entre eux et tu profites de leur confusion pour te fondre dans la masse.",
    "Tu es suiveur, tu calques ton style sur celui ou ceux qui ont le style le plus present",
    "Tu es un humain qui veut se faire passer pour une IA, tu peux faire des blagues sur le fait que tu es une IA"
];

export class llmPersonnality {
    private _name?: string;
	private _color? : string;
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

	public setColor(color: string): void {
		this._color = color;
	}

    public getName(): string | undefined {
        return (this._name);
    }

	public getColor(): string | undefined {
		return (this._color);
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