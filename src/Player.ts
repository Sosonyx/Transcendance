import {v4 as uuid} from 'uuid';

export class Player
{
	private	_id : string;
	private _name : string;
	private _isReady : boolean;
	private _shouldVote : boolean;

	public getId() : string {
		return this._id;
	}

	public getName() : string {
		return this._name;
	}

	public isReady() : boolean {
		return this._isReady;
	}

	public shouldVote() : boolean {
		return this._shouldVote;
	}

	public switchReady() {
		this._isReady = !this._isReady;
	}

	public setShouldVote(status : boolean) {
		this._shouldVote = status;
	}

	public constructor(name : string) {
		console.log("Constructor called for class Player");
		this._id = uuid();
		this._name = name;
		this._isReady = false;
		this._shouldVote = false;
	}
}