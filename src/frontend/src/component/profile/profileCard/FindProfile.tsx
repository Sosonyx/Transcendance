import { useState } from 'react';
import { getOtherProfiles } from '../../../services/api.js';
import { Profile } from './ProfileCard.js';
import type { User } from '../../../types/types.js';
import '../../auth/AuthModal.css'
import './Profile.css'
import './FindProfile.css'

export function OtherProfileSearch() {
	const [profileUsername, setProfileUsername] = useState('');
	const [otherProfile, setOtherProfile] = useState<User | null>(null);
	const [profileError, setProfileError] = useState('');

	const OtherProfileLookup = async () => {
		setProfileError('');
		setOtherProfile(null);

		if (!profileUsername) {
			setProfileError(`Entrez un nom d'utilisateur.`);
			return;
		}

		try {
			const profile: User = await getOtherProfiles(profileUsername);
			setOtherProfile(profile);
		} catch {
			setOtherProfile(null);
			setProfileError(`Le nom d'utilisateur n'existe pas`);
		}
	};

	return (
		<div className='finder-div'>
			<h2>Chercher un joueur</h2>
			<div className='profile-finder'>
			<input className='username-form'
				value={profileUsername}
				onChange={(event) => setProfileUsername(event.target.value)}
				placeholder="Nom d'utilisateur"
				onKeyDown={(e) => { if (e.key === 'Enter') OtherProfileLookup(); }}
			/>
			</div>
			<button className='button-profile' onClick={OtherProfileLookup}>Chercher</button>
			{profileError && <p className='error-msg'>{profileError}</p>}
			{otherProfile && <Profile user={otherProfile} readonly />}
		</div>
	);
}