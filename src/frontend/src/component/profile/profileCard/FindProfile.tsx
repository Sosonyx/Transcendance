import { useState } from 'react';
import { getOtherProfiles } from '../../../services/api.js';
import { Profile } from './ProfileCard.js';
import type { User } from '../../../types/types.js';
import './Profile.css'

export function OtherProfileSearch() {
	const [profileUsername, setProfileUsername] = useState('');
	const [otherProfile, setOtherProfile] = useState<User | null>(null);
	const [profileError, setProfileError] = useState('');

	const OtherProfileLookup = async () => {
		setProfileError('');
		setOtherProfile(null);

		if (!profileUsername) {
			setProfileError('Enter a username.');
			return;
		}

		try {
			const profile: User = await getOtherProfiles(profileUsername);
			setOtherProfile(profile);
		} catch {
			setOtherProfile(null);
			setProfileError('User not found');
		}
	};

	return (
		<div className='finder-div'>
			<h2>Find a profile</h2>
			<div className='profile-finder'>
			<input className='username-form'
				value={profileUsername}
				onChange={(event) => setProfileUsername(event.target.value)}
				placeholder="username"
				onKeyDown={(e) => { if (e.key === 'Enter') OtherProfileLookup(); }}
			/>
			</div>
			<button className='button-profile' onClick={OtherProfileLookup}>Find</button>
			{profileError && <p>{profileError}</p>}
			{otherProfile && <Profile user={otherProfile} readonly />}
		</div>
	);
}