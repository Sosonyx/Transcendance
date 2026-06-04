import { useState } from "react";
import { Socket } from "socket.io-client";

interface LobbyPanelProps {
	socket: Socket | null;
}

function LobbyPanel({ socket }: LobbyPanelProps) {
	const [ready, setReady] = useState<boolean>(false);
	const handleClick = () => {
		socket?.emit('ready');
		setReady(true);
	};
	return (
	<div className="centered">
			<button id="ready-btn" type="button" onClick={handleClick} disabled={ready}>
				{ready ? 'Waiting for other players...' : 'Ready'}
			</button>
	</div>
	);
};

export default LobbyPanel;