import EventEmitter from "node:events";

export class Player extends EventEmitter
{
	private	_id : string;
	private _name : string;
	private	_isLLM : boolean;
	private _isReady : boolean;
	private _shouldVote : boolean;
	private _wantReplay : boolean;
	private	_voteAgainst : Player | null;
	private	_score : number;

	public getId() : string {
		return this._id;
	}

	public getName() : string {
		return this._name;
	}

	public getIsLLM() : boolean {
		return this._isLLM;
	}

	public isReady() : boolean {
		return this._isReady;
	}

	public shouldVote() : boolean {
		return this._shouldVote;
	}

	public getWantReplay() : boolean {
		return this._wantReplay;
	}

	public getVoteAgainst() : Player | null {
		return (this._voteAgainst)
	}

	public incrementScore(value : number) {
		this._score += value;
	}

	public switchReady() {
		this._isReady = !this._isReady;
	}

	public reset() {
		this._isReady = false;
		this._shouldVote = false;
		this._wantReplay = false;
		this._voteAgainst = null;
		this._score = 0;
	}

	public setShouldVote(status : boolean) {
		this._shouldVote = status;
	}

	public setWantReplay(status : boolean) {
		this._wantReplay = status;
	}

	public setVoteAgainst(target : Player | null)
	{
		this._voteAgainst = target;
	}

	public constructor(id : string, isLLM : boolean = false) {
		super();
		console.log("Constructor called for class Player");
		this._id = id;
		this._name = 'no-name';
		this._isLLM = isLLM;
		this._isReady = false;
		this._shouldVote = false;
		this._wantReplay = false;
		this._voteAgainst = null;
		this._score = 0;
	}
}