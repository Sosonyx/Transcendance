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

	return (<>
		<div className="leaderboard-container">
			<h2>Global ranking (Top 10)</h2>
			{players[0]?.username}
		</div>
	</>)
}