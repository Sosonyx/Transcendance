import EventEmitter from "node:events";
import { v4 as uuid} from "uuid";

export class Player extends EventEmitter
{
	private		_id : string;
	private 	_userId : string | null;
	protected	_name : string;
	protected	_acted : boolean;
	private 	_wantReplay : boolean;
	protected	_voteAgainst : Player | null;
	private		_score : number;
	protected 	_eliminated : boolean;

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
		return (false);
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

	public getEliminated() : boolean {
		return (this._eliminated)
	}

	public incrementScore(value : number) {
		this._score += value;
	}

	public reset(full : boolean = true) {
		if (full)
		{
			this._id = uuid();
			this._score = 0;
			this._wantReplay = false;
			this._eliminated = false;
		}
		this._acted = false;
		this._voteAgainst = null;
	}

	public setName(name : string) {
		this._name = name;
	}

	public setActed(status : boolean) {
		this._acted = status;
	}

	public switchActed() {
		this._acted = !this._acted;
	}

	public setWantReplay(status : boolean) {
		this._wantReplay = status;
	}

	public setVoteAgainst(target : Player | null)
	{
		this._voteAgainst = target;
	}

	public setEliminated(status : boolean)
	{
		this._eliminated = status;
		console.log(`Eliminated ${this._name} : ${this.getIsLLM() ? 'LLM' : 'human'}`);
	}

	public constructor(userId : string | null) {
		super();
		console.log("Constructor called for class Player");
		this._id = uuid();
		this._userId = userId;
		this._name = 'no-name';
		this._acted = false;
		this._wantReplay = false;
		this._voteAgainst = null;
		this._score = 0;
		this._eliminated = false;
	}
}