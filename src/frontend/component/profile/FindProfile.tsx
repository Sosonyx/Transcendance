import { useState } from 'react';
import { getOtherProfiles } from '../../services/api.js';
import { Profile } from './ProfileCard.js';
import type { User } from '../../types/types.js';

type OtherProfileResponse = User & {
	stats?: {
		numberOfGames: number;
		gamesWon: number;
		gamesLost: number;
		winrate: number;
		totalScore: number;
	};
};

export function OtherProfileSearch() {
	const [profileUsername, setProfileUsername] = useState('');
	const [otherProfile, setOtherProfile] = useState<OtherProfileResponse | null>(null);
	const [profileError, setProfileError] = useState('');

	const OtherProfileLookup = async () => {
		setProfileError('');

		if (!profileUsername.trim()) {
			setProfileError('Entre un username.');
			return;
		}

		try {
			const profile = await getOtherProfiles(profileUsername.trim());
			setOtherProfile(profile);
		} catch {
			setOtherProfile(null);
			setProfileError('User not found');
		}
	};

	return (
		<section>
			<h2>Voir un autre profil</h2>
			<input
				value={profileUsername}
				onChange={(event) => setProfileUsername(event.target.value)}
				placeholder="username"
			/>
			<button onClick={OtherProfileLookup}>Chercher</button>
			{profileError && <p>{profileError}</p>}
			{otherProfile && <Profile user={otherProfile} />}
		</section>
	);
}