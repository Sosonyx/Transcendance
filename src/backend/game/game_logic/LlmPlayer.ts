import { Player } from "./Player.js"
import { Llm } from "../../llm/llm.js"
import type { EventEmitter } from "node:stream";

export class LlmPlayer extends Player
{
	private	_brain : Llm | null;

	public override getIsLLM() : boolean {
		return (true);
	}

	public getBrain() : Llm | null {
		return (this._brain);
	}

	public override setName(name: string): void {
		this._name = name;
		this._brain?.setName(name);
	}

	public override setEliminated(status: boolean): void {
		this._eliminated = status;
		if (status)
			this._brain = null;
	}

	public override reset() : void {
		this._acted = false;
		this._voteAgainst = null;
		this._brain?.clearHistory();
	}

	public _init(roomEmitter : EventEmitter, playerNames : string[])
	{
		this._brain = new Llm (roomEmitter, playerNames);
	}

	public constructor()
	{
		super(null);
		this._brain = null;
	}
}