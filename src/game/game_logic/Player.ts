import EventEmitter from "node:events";
import { v4 as uuid} from "uuid";

export class Player extends EventEmitter
{
	private	_id : string;
	private _userId : string | null;
	private _name : string;
	private	_isLLM : boolean;
	private _isReady : boolean;
	private _acted : boolean;
	private _wantReplay : boolean;
	private	_voteAgainst : Player | null;
	private	_score : number;

	public getId() : string {
		return this._id;
	}

	public getUserId() : string | null {
		return this._userId;
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

	public hasActed() : boolean {
		return this._acted;
	}

	public getWantReplay() : boolean {
		return this._wantReplay;
	}

	public getVoteAgainst() : Player | null {
		return (this._voteAgainst)
	}

	public getScore() : number {
		return (this._score)
	}

	public incrementScore(value : number) {
		this._score += value;
	}

	public switchReady() {
		this._isReady = !this._isReady;
	}

	public reset(full : boolean = true) {
		console.log('player reset as');
		console.log(full);
		if (full)
		{
			this._id = uuid();
			this._score = 0;
			this._wantReplay = false;
		}
		this._isReady = false;
		this._acted = false;
		this._voteAgainst = null;
		this._name = '';
	}

	public setName(name : string) {
		this._name = name;
	}

	public setActed(status : boolean) {
		this._acted = status;
	}

	public setWantReplay(status : boolean) {
		this._wantReplay = status;
	}

	public setVoteAgainst(target : Player | null)
	{
		this._voteAgainst = target;
	}

	public constructor(userId : string | null, isLLM : boolean = false) {
		super();
		console.log("Constructor called for class Player");
		this._id = uuid();
		this._userId = userId;
		this._name = 'no-name';
		this._isLLM = isLLM;
		this._isReady = false;
		this._acted = false;
		this._wantReplay = false;
		this._voteAgainst = null;
		this._score = 0;
	}
}