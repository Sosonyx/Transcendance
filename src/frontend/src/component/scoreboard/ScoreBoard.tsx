import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ScoreInfo } from "../../types/types";
import "./ScoreBoard.css";

interface ScoreBoardProps {
	socket: Socket | null;
}

function ScoreBoard({ socket }: ScoreBoardProps) {
	const [scoreInfo, setScoreInfo] = useState<ScoreInfo | null>(null);

	useEffect(()=>{
		if (!socket) return;
		
		socket?.on('score_info', (sI: ScoreInfo) => {
			setScoreInfo(sI);
			console.log("Score Info:", sI);
			console.log("Score Info:", scoreInfo);
		});

		return (() => { socket?.off('score_info', setScoreInfo); });
	},[socket])

	if (scoreInfo === null) return null;

	return (
		<div className="score-layout">
			<ul className="score-list">
				{scoreInfo._alive.map((player, index) => (
					<li key={index} className="alive">{player[0]}{player[1] !== null && ` : ${player[1]}`}</li>
				))}
				{scoreInfo._eliminated.map((player, index) => (
					<li key={index} className="dead">{player[0]}</li>
				))}
			</ul>
		</div>
	);
}

export default ScoreBoard;