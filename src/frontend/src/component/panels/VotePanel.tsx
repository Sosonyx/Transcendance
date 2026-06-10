import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import type { VoteInfo } from "../../types/types";
import './VotePanel.css';
import Timer from "../timer/Timer";

interface VotePanelProps {
	socket: Socket | null;
	timeEnd: number | null;
	players: VoteInfo[];
	userId: string;
}

function VotePanel({ socket, timeEnd, players, userId }: VotePanelProps) {
	const [votedFor, setVotedFor] = useState<string | null>(null);
	const [votes, setVotes] = useState<VoteInfo[]>(players);

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

	const currentPlayer: VoteInfo | undefined = votes.find(p => p[0] === userId);
    const otherPlayers: VoteInfo[]  = votes.filter(p => p[0] !== userId);

	useEffect(() => {
		if (!socket) return;

		socket?.on('vote-info', setVotes);

		return () => { socket?.off('vote-info', setVotes); };
	}, [socket]);

	return (
		<>
		<Timer timeEnd={timeEnd} />
        <div className="vote-layout">

            {currentPlayer && (
                <div className="vote-self">
                    <img src="/avatars/avatar.png" alt={currentPlayer[1]} className="player-avatar" />
                    <p className="vote-self-name">{currentPlayer[1]}</p>
                    <div className="vote-self-count">
                        <span>{currentPlayer[2]}</span>
                        <p>vote{currentPlayer[2] !== 1 ? 's' : ''} contre vous</p>
                    </div>
                </div>
            )}

            <div className="vote-grid">
                {otherPlayers.map((player) => (
                    <div
                        key={player[1]}
                        className={getCardClass(player[1])}
                        onClick={() => handleVote(player)}
                    >
                        <img src="/avatars/avatar.png" alt={player[1]} className="player-avatar" />
                        <h3>{player[1]}</h3>
                        {player[2] > 0 && (
                            <span className="vote-badge">{player[2]}</span>
                        )}
                    </div>
                ))}
            </div>

        </div>
		</>
    );
};

export default VotePanel;