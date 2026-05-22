import EventEmitter from "node:events";

export class Player extends EventEmitter
{
	private	_id : string;
	private _name : string;
	private _isReady : boolean;
	private _shouldVote : boolean;
	private _wantReplay : boolean;

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

	public getWantReplay() : boolean {
		return this._wantReplay;
	}

	public switchReady() {
		this._isReady = !this._isReady;
	}

	public reset() {
		this._isReady = false;
		this._shouldVote = false;
		this._wantReplay = false;
	}

	public setShouldVote(status : boolean) {
		this._shouldVote = status;
	}

	public setWantReplay(status : boolean) {
		this._wantReplay = status;
	}

	public constructor(id : string) {
		super();
		console.log("Constructor called for class Player");
		this._id = id;
		this._name = 'no-name';
		this._isReady = false;
		this._shouldVote = false;
		this._wantReplay = false;
	}
}