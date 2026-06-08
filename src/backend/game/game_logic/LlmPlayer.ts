import { Player } from "./Player.js"
import type { Llm } from "../../llm/llm.js"

export class LlmPlayer extends Player
{
	private	_brain : Llm;

	public override getIsLLM() : boolean {
		return (false);
	}

	public getBrain() : Llm {
		return (this._brain);
	}

	public constructor()
	{
		super(null);
		this._brain = 
	}
}