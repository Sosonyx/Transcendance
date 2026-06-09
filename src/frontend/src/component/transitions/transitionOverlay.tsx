
function TransitionOverlay({ config }: { config: string }) {
	return (
		<div className="transition-overlay">
			<h1>{config}</h1>
		</div>
	);
}

export default TransitionOverlay;