import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ScoreInfo } from "../../types/types";
import "./ScoreBoard.css";

interface ScoreBoardProps {
	socket: Socket | null;
	username: string;
	setEliminated: React.Dispatch<React.SetStateAction<boolean>>
}

function ScoreBoard({ socket, username, setEliminated }: ScoreBoardProps) {
	const [scoreInfo, setScoreInfo] = useState<ScoreInfo | null>(null);

	useEffect(()=>{
		if (!socket) return;
		
		socket.on('score_info', setScoreInfo);

		return (() => { socket.off('score_info', setScoreInfo); });
	},[socket])

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