import { useEffect } from "react";
import type { ScoreInfo } from "../../types/types";
import "./ScoreBoard.css";

interface ScoreBoardProps {
	username: string;
	scoreInfo: ScoreInfo | null;
	setEliminated: React.Dispatch<React.SetStateAction<boolean>>
}

function ScoreBoard({ username, scoreInfo, setEliminated }: ScoreBoardProps) {

	useEffect(() => {
		if (!scoreInfo) return;
		if (scoreInfo._eliminated.some(([name]) => name === username)) {
			setEliminated(true);
		}
	}, [scoreInfo, username]);

	if (scoreInfo === null) return null;

	return (
		<div className="score-layout">
			<ul className="score-list">
				{scoreInfo._alive.map(([username, score], index) => (
					<li key={index} className="alive">
						<span>{username}</span>
        				{score !== null && <span>{score}</span>}
					</li>
				))}
				{scoreInfo._eliminated.map(([username], index) => (
					<li key={index} className="dead">{username}</li>
				))}
			</ul>
		</div>
	);
}

export default ScoreBoard;