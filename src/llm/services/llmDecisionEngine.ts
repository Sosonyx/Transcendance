export class LlmDecisionEngine {
	private readonly	_nbPlayers: number;
	private				_globalQuestion: string | undefined;

	public constructor(nbPlayers: number) {
		this._nbPlayers = nbPlayers;
	}

	public shouldSpontaneouslyAnswer(): boolean {
		const prob = Math.min(0.4, 1 / this._nbPlayers);

		return Math.random() < prob;
	}

	public setGlobalQuestion(question: string): void {
		this._globalQuestion = question;
	}

	// We consume the global question because we want to trigger the spontaneous answer only once after the question is set, 
	// and not on every tick while the question is the same.
	public consumeGlobalQuestion(): string | undefined {
		const globalQuestion = this._globalQuestion;
		this._globalQuestion = undefined;

		return globalQuestion;
	}
}
