import { useState } from "react";
import { Socket } from "socket.io-client";

interface VotePanelProps {
	socket: Socket | null;
	players: string[];
}

function VotePanel({ socket, players }: VotePanelProps) {
	const [votedFor, setVotedFor] = useState<string | null>(null);

	const handleVote = (player: string) => {
		if (votedFor) return;
		socket?.emit('vote', player);
		setVotedFor(player);
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
						key={player}
						className={getCardClass(player)}
						onClick={() => handleVote(player)}
					>
						<img src="/avatars/avatar.png" alt={player} className="player-avatar" />
						<h3>{player}</h3>
					</div>
				))}
			</div>
		</div>
	);
};

export default VotePanel;