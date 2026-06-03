import { useState } from "react";
import { Socket } from "socket.io-client";
import type { VoteInfo } from "../types";

interface VotePanelProps {
	socket: Socket | null;
	players: VoteInfo[];
}

function VotePanel({ socket, players }: VotePanelProps) {
	const [votedFor, setVotedFor] = useState<string | null>(null);

	const handleVote = (player: VoteInfo) => {
		if (votedFor) return;
		socket?.emit('vote', player[0]);
		setVotedFor(player[1]);
	};
	
	const getCardClass = (player: string): string => {
		if (votedFor === player) return 'player-card voted';
		if (votedFor)            return 'player-card disabled';
		return 'player-card';
	};

	return (
		<div className="centered">
			<div className="vote-grid">
				{players.map((player) => (
					<div
						key={player[1]}
						className={getCardClass(player[1])}
						onClick={() => handleVote(player)}
					>
						<img src="/avatars/avatar.png" alt={player[1]} className="player-avatar" />
						<h3>{player[1]}</h3>
					</div>
				))}
			</div>
		</div>
	);
};

export default VotePanel;