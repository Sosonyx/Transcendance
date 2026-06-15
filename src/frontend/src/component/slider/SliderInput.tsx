interface SliderInputProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
}

function SliderInput({label, value, min, max, step, onChange}: SliderInputProps) {
	const clamp = (v: number) => Math.min(max, Math.max(min, v));

	return (
		<div className="param-row">
			<span className="param-label">{label}</span>
			<input
				type="range" min={min} max={max} step={step} value={value}
				onChange={e => onChange(clamp(Number(e.target.value)))}
			/>
			<input
				type="number" className="param-input" min={min} max={max} step={step} value={value}
				onChange={e => onChange(clamp(Number(e.target.value)))}
			/>
		</div>
	);
}

export default SliderInput;