import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import './ResultPanel.css';
import Timer from "../timer/Timer";

interface ResultPanelProps {
	socket: Socket | null;
	timeEnd: number | null;
}

function ResultPanel({ socket, timeEnd }: ResultPanelProps) {
	const [timedOut, setTimedOut] = useState<boolean>(false);
	const [clicked, setClicked] = useState<boolean>(false);

	const handleReplay = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		socket?.emit('replay');
		setClicked(true);
	};

	const handleNewGame = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		socket?.emit('newGame');
		setClicked(true);
	};

	const handleTimeOut = () => {
		setTimedOut(true);
	};

	useEffect(() => {
		if (!socket) return;

		socket?.on('timedOut', handleTimeOut);

		return () => { socket.off('timedOut', handleTimeOut) };
	}, [socket]);

	return (
		<>
		<Timer timeEnd={timeEnd} />
		<div className="centered">
			<button id="replay-btn" onClick={handleReplay} disabled={timedOut || clicked}>Replay</button>
			<button id="new-game-btn" onClick={handleNewGame} disabled={clicked}>New game</button>
		</div>
		</>
	);
};

export default ResultPanel;