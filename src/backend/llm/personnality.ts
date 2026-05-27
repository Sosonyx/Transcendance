export class llmPersonnality
{
    private _name?: string;
    private _players?: string[];
    private _temper: string;
    private _wayOfSpeaking: string;
    private _iaStrategie: string;

    public constructor(players: string[], llmName: string)
    {
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
    var str: string = "";
    const random = (Math.random() * 4);
    switch (random) {
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

export function giveWayOfSpeaking(): string {
    var str: string = "";
    const random = (Math.random() * 4);
    switch (random) {
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

export function giveIaStrategie(): string {
    var str: string = "";
    const random = (Math.random() * 4);
    switch (random) {
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