import { useEffect, useState } from 'react'
import type { LeaderboardUser } from '../../../types/types';
import { getLeaderbord } from '../../../services/api.js';
import './Leaderboard.css'


export function Leaderboard() {
	const [players, setPlayers] = useState<LeaderboardUser[]>([]);
	const [error, setError] = useState('');

	useEffect(() => {
		async function fetchLeaderboard() {
			try{
				const data: LeaderboardUser[] = await getLeaderbord();
				setPlayers(data)
			}
			catch{
				setError('Error fetching leaderboard')
			}
		}
		fetchLeaderboard();
	},[])
	players;
	if (error)
		return (<>
		<div className='error-msg'>{error}</div>
		</>)

	return (
	<div className="leaderboard-container">
    <h2 className="leaderboard-title">Global Ranking</h2>
    <div className="leaderboard-list">
		{players.length === 0 && <p className="leaderboard-empty">Aucun joueur</p>}
		{players.map((player, index) => (
        <div key={index} className="leaderboard-item">
			<span className="leaderboard-rank">#{index + 1}</span>
			<span className="leaderboard-username">{player.username}</span>
			<span className="leaderboard-winrate">{player.winrate ?? 0}%</span>
        </div>
		))}
    </div>
	</div>
)
}