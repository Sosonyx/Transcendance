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
	const players = lobbyInfo?._players.length ?? 0;
	const llms    = lobbyInfo?._llmCount ?? 0;
	const spots   = lobbyInfo?._spots ?? 0;
	const total   = players + llms + spots;
	const taken   = players + llms;

	const handleClick = () => {
		socket?.emit('ready');
		setReady(!ready);
	};

	useEffect(() => {
		if (!socket) return;

		socket?.on('lobby_info', setLobbyInfo);

		return () => { socket?.off('lobby_info', setLobbyInfo); };
	}, [socket]);

	return (
		<div className="lobby">

			<h1 className="lobby-mode">{lobbyInfo?._mode}</h1>
			<p className="lobby-count">
				{taken} / {total}
			</p>
			<div className="lobby-players">
				{lobbyInfo?._players.map((username, index) => (
					<div key={index} className="lobby-card player">
						<img src="/avatars/avatar.png" alt={username} className="lobby-avatar" />
						<p>{username}</p>
					</div>
				))}
				{Array.from({ length: llms }).map((_, index) => (
					<div key={`llm-${index}`} className="lobby-card llm">
						<img src="/avatars/llm-avatar.png" alt="LLM" className="lobby-avatar" />
						<p>LLM</p>
					</div>
				))}
				{Array.from({ length: spots }).map((_, index) => (
					<div key={`empty-${index}`} className="lobby-card empty">
						<div className="lobby-avatar-placeholder" />
						<p>...</p>
					</div>
				))}
			</div>

			<button id="ready-btn" type="button" onClick={handleClick} className={ready ? 'is-ready' : ''}>
				{ready ? '✓ Ready' : 'Ready'}
			</button>

		</div>
	);
};

export default LobbyPanel;