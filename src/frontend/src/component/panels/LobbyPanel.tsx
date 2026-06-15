import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import './LobbyPanel.css';
import type { LobbyInfo } from "../../types/types";
import GameConfigPanel from "./GameConfigPanel";

interface LobbyPanelProps {
	socket: Socket | null;
	isCustom : boolean;
}

function LobbyPanel({ socket, isCustom }: LobbyPanelProps) {
	const [ready, setReady] = useState<boolean>(false);
	const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>();
	const players = lobbyInfo?._players.length ?? 0;
	const ias    = lobbyInfo?._llmCount ?? 0;
	const spots   = lobbyInfo?._spots ?? 0;
	const total   = players + spots;
	const taken   = players;

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

			{isCustom && <GameConfigPanel socket={socket}/>}

			<div className="lobby-header">
				<h1 className="lobby-mode">{lobbyInfo?._mode}</h1>
			</div>

			<div className="lobby-middle">
				<p className="lobby-count">
					<span>{taken} / {total} joueurs</span>
					<span className="lobby-llm-count">{ias} IA{ias !== 1 ? 's' : ''}</span>
				</p>
				<div className="lobby-players">
					{lobbyInfo?._players.map(([username, isReady], index) => (
						<div key={index} className={`lobby-card player ${isReady ? 'ready' : ''}`}>
							<img src="/avatars/avatar.png" alt={username} className="lobby-avatar" />
							<p>{username}</p>
						</div>
					))}
					{Array.from({ length: ias }).map((_, index) => (
						<div key={`llm-${index}`} className="lobby-card llm">
							<img src="/avatars/llm-avatar.png" alt="IA" className="lobby-avatar" />
							<p>IA</p>
						</div>
					))}
					{Array.from({ length: spots }).map((_, index) => (
						<div key={`empty-${index}`} className="lobby-card empty">
							<div className="lobby-avatar-placeholder" />
							<p>...</p>
						</div>
					))}
				</div>
			</div>

			<div className="lobby-footer">
				<button id="ready-btn" type="button" onClick={handleClick} className={ready ? 'is-ready' : ''}>
					{ready ? 'Prêt' : 'Prêt'}
				</button>
			</div>

		</div>
	);
};

export default LobbyPanel;