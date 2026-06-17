// import { useState } from 'react';
// import { getOtherProfiles } from '../../../services/api.js';
// import { Profile } from './ProfileCard.js';
// import type { User } from '../../../types/types.js';
// import '../../auth/AuthModal.css'
// import './Profile.css'
// import './FindProfile.css'

// export function OtherProfileSearch() {
// 	const [profileUsername, setProfileUsername] = useState('');
// 	const [otherProfile, setOtherProfile] = useState<User | null>(null);
// 	const [profileError, setProfileError] = useState('');

// 	const OtherProfileLookup = async () => {
// 		setProfileError('');
// 		setOtherProfile(null);

// 		if (!profileUsername) {
// 			setProfileError(`Entrez un nom d'utilisateur.`);
// 			return;
// 		}

// 		try {
// 			const profile: User = await getOtherProfiles(profileUsername);
// 			setOtherProfile(profile);
// 		} catch {
// 			setOtherProfile(null);
// 			setProfileError(`Le nom d'utilisateur n'existe pas`);
// 		}
// 	};

// 	return (
// 		<div className='finder-div'>
// 			<h2>Chercher un joueur</h2>
// 			<div className='profile-finder'>
// 			<input className='username-form'
// 				value={profileUsername}
// 				onChange={(event) => setProfileUsername(event.target.value)}
// 				placeholder="Nom d'utilisateur"
// 				onKeyDown={(e) => { if (e.key === 'Enter') OtherProfileLookup(); }}
// 			/>
// 			</div>
// 			<button className='button-profile' onClick={OtherProfileLookup}>Chercher</button>
// 			{profileError && <p className='error-msg'>{profileError}</p>}
// 			{otherProfile && <Profile user={otherProfile} readonly />}
// 		</div>
// 	);
// }

import { useState } from 'react';
import { getOtherProfiles } from '../../../services/api.js';
import { Profile } from './ProfileCard.js';
import type { User } from '../../../types/types.js';
import '../../auth/AuthModal.css'
import './Profile.css'
import './FindProfile.css'

interface Friend {
	id: string;
	username: string;
	avatar?: string | null;
}

interface OtherProfileSearchProps {
	friendList: Friend[];
	onFriendsChanged: () => void;
	onSelectFriend: (friend: Friend) => void;
}

export function OtherProfileSearch({ friendList, onFriendsChanged, onSelectFriend }: OtherProfileSearchProps) {
	const [profileUsername, setProfileUsername] = useState('');
	const [otherProfile, setOtherProfile] = useState<User | null>(null);
	const [profileError, setProfileError] = useState('');
	const [actionError, setActionError] = useState('');

	const OtherProfileLookup = async () => {
		setProfileError('');
		setActionError('');
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

	const isFriend = otherProfile
		? friendList.some((f) => f.id === otherProfile.id)
		: false;

	const handleAddFriend = async () => {
		if (!otherProfile) return;
		setActionError('');
		try {
			const res = await fetch(`/api/friend/${otherProfile.username}`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				setActionError(body.error || `Erreur ${res.status}`);
				return;
			}
			onFriendsChanged();
		} catch {
			setActionError('Erreur réseau');
		}
	};

	const handleRemoveFriend = async () => {
		if (!otherProfile) return;
		setActionError('');
		try {
			const res = await fetch(`/api/friend/${otherProfile.username}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				setActionError(body.error || `Erreur ${res.status}`);
				return;
			}
			onFriendsChanged();
		} catch {
			setActionError('Erreur réseau');
		}
	};

	const handleMessage = () => {
		if (!otherProfile) return;
		onSelectFriend({
			id: otherProfile.id,
			username: otherProfile.username,
			avatar: otherProfile.avatar ?? null,
		});
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
			{otherProfile && (
				<>
					<Profile user={otherProfile} readonly />
					<div className="friend-actions">
						{isFriend ? (
							<button onClick={handleRemoveFriend}>Retirer des amis</button>
						) : (
							<button onClick={handleAddFriend}>Ajouter en ami</button>
						)}
						{isFriend && (
							<button onClick={handleMessage}>Envoyer un message</button>
						)}
					</div>
					{actionError && <p className='error-msg'>{actionError}</p>}
				</>
			)}
		</div>
	);
}