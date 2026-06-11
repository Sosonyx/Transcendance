import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import type { VoteInfo } from "../../types/types";
import './VotePanel.css';

interface VotePanelProps {
	socket: Socket | null;
	players: VoteInfo[];
	userId: string;
}

function VotePanel({ socket, players, userId }: VotePanelProps) {
	const [votedFor, setVotedFor] = useState<string | null>(null);
	const [votes, setVotes] = useState<VoteInfo[]>(players);

	const handleVote = (player: VoteInfo) => {
		if (votedFor) return;
		socket?.emit('vote', player[1]);
		setVotedFor(player[2]);
	};
	
	const getCardClass = (player: string): string => {
		if (votedFor === player) return 'player-card voted';
		if (votedFor)            return 'player-card disabled';
		return 'player-card';
	};

	const currentPlayer: VoteInfo | undefined = votes.find(p => p[0] === userId);
    const otherPlayers: VoteInfo[]  = votes.filter(p => p[0] !== userId);

	useEffect(() => {
		if (!socket) return;

		socket?.on('vote-info', setVotes);

		return () => { socket?.off('vote-info', setVotes); };
	}, [socket]);

	return (
        <div className="vote-layout">

            {currentPlayer && (
                <div className="vote-self">
                    <img src="/avatars/avatar.png" alt={currentPlayer[2]} className="player-avatar" />
                    <p className="vote-self-name">{currentPlayer[2]}</p>
                    <div className="vote-self-count">
                        <span>{currentPlayer[3]}</span>
                        <p>vote{currentPlayer[3] !== 1 ? 's' : ''} contre vous</p>
                    </div>
                </div>
            )}

            <div className="vote-grid">
                {otherPlayers.map((player) => (
                    <div
                        key={player[2]}
                        className={getCardClass(player[2])}
                        onClick={() => handleVote(player)}
                    >
                        <img src="/avatars/avatar.png" alt={player[2]} className="player-avatar" />
                        <h3>{player[2]}</h3>
                        {player[3] > 0 && (
                            <span className="vote-badge">{player[3]}</span>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default VotePanel;