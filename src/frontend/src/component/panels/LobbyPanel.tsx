import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import './LobbyPanel.css';
import type { LobbyInfo } from "../../types/types";

interface LobbyPanelProps {
	socket: Socket | null;
}

function LobbyPanel({ socket }: LobbyPanelProps) {
	const [ready, setReady] = useState<boolean>(false);
	const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>();

	const handleClick = () => {
		socket?.emit('ready');
		setReady(true);
	};

	useEffect(() => {
		if (!socket) return;

		socket?.on('lobby_info', setLobbyInfo);

		return () => { socket?.off('lobby_info', setLobbyInfo); };
	}, [socket]);

	return (
	<div className="centered">
		<div>
			<p>{lobbyInfo?._mode}</p>
			<div className="row">
				{lobbyInfo?._players.map((player) => (
					<div className="cols-sm">
						<div className="card">
							<p>{player}</p>
						</div>
					</div>
				))}
			</div>
		</div>
		<button id="ready-btn" type="button" onClick={handleClick} disabled={ready}>
			{ready ? 'Waiting for other players...' : 'Ready'}
		</button>
	</div>
	);
};

export default LobbyPanel;