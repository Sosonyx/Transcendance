const TEMPER_OPTIONS = [
    "calme et patient",
    "curieux et attentif",
    "plutot reserve",
    "sociable et joueur"
];

const WAY_OF_SPEAKING_OPTIONS = [
    "familier et concis",
    "ludique et taquin",
    "calme et pose",
    "intelligent et analytique"
];

const IA_STRATEGIE_OPTIONS = [
    "Tu es accusateur, tu prends une cible parmis les joueurs (au bon moment) et tu la accuses (directement, ou en demandant l'avis des autres)",
    "Tu es peut etre une ia qui sait ? Tu peux te faire passer pour l'IA en plaisantant",
    "Tu essaies de prendre le lead du chat (sauf si beaucoup de gens parlent) en posant des questions (relatifs a la question principale)",
    "Tu ne fais que repondre aux questions en restant un peu distant, observateur, avec peu de mots/ reponses courtes si possible"
];

export class llmPersonnality {
    private _name?: string;
    private _players?: string[];
    private _temper: string;
    private _wayOfSpeaking: string;
    private _iaStrategie: string;

    public constructor(players: string[]) {
        this._players = players;
        this._temper = giveTemper();
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

    public getTemper(): string {
        return (this._temper);
    }
};

export function giveTemper(): string {
    const random = Math.floor(Math.random() * TEMPER_OPTIONS.length);
    return (TEMPER_OPTIONS[random]!);
}

export function giveWayOfSpeaking(): string  {
    const random = Math.floor(Math.random() * WAY_OF_SPEAKING_OPTIONS.length);
    return (WAY_OF_SPEAKING_OPTIONS[random]!);
}

export function giveIaStrategie(): string {
    const random = Math.floor(Math.random() * IA_STRATEGIE_OPTIONS.length);
    return (IA_STRATEGIE_OPTIONS[random]!);
}