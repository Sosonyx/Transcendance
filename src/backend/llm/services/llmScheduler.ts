enum LlmSchedulerState {
	Stopped = "stopped",
	Idle = "idle",
	Answering = "answering"
}

export class LlmScheduler {
	private readonly	_intervalMs: number;
	private readonly	_jitterMs: number;

	private			_state: LlmSchedulerState = LlmSchedulerState.Stopped;
	private			_timer: NodeJS.Timeout | null = null;

	public constructor(intervalMs = 5000, jitterMs = 2000) {
		this._intervalMs = intervalMs;
		this._jitterMs = jitterMs;
	}

	public start(onTick: () => void): void {
		if (this._state !== LlmSchedulerState.Stopped)
			return;

		this._state = LlmSchedulerState.Idle;
		this.scheduleNextTick(onTick);
	}

	public stop(): void {
		if (this._state === LlmSchedulerState.Stopped)
			return;

		this._state = LlmSchedulerState.Stopped;
		this.clearTimer();
	}

	public tryBeginAnswering(): boolean {
		if (this._state !== LlmSchedulerState.Idle)
			return false;

		this._state = LlmSchedulerState.Answering;
		return true;
	}

	public finishAnswering(onCanSchedule: () => void): void {
		if (this._state === LlmSchedulerState.Stopped)
			return;

		this._state = LlmSchedulerState.Idle;
		onCanSchedule();
	}

	public canEmit(): boolean {
		return this._state !== LlmSchedulerState.Stopped;
	}

	public scheduleNextTick(onTick: () => void): void {
		if (this._state === LlmSchedulerState.Stopped || this._timer)
			return;

		this._timer = setTimeout(() => {
			this._timer = null;
			onTick();
		}, this.computeDelay());
	}

	private computeDelay(): number {
		if (this._jitterMs <= 0)
			return this._intervalMs;

		const jitter = Math.random() * this._jitterMs;
		const sign = Math.random() < 0.5 ? -1 : 1;

		return Math.round(this._intervalMs + sign * jitter);
	}

	private clearTimer(): void {
		if (!this._timer)
			return;

		clearTimeout(this._timer);
		this._timer = null;
	}
}
