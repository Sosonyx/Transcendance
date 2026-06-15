import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import './ResultPanel.css';

interface ResultPanelProps {
	socket: Socket | null;
}

function ResultPanel({ socket }: ResultPanelProps) {
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
		<div className="centered">
			<button id="replay-btn" className="game-button" onClick={handleReplay} disabled={timedOut || clicked}> Rejouer </button>
			<button id="new-game-btn" className="game-button" onClick={handleNewGame} disabled={clicked}> Nouvelle partie </button>
		</div>
	);
};

export default ResultPanel;