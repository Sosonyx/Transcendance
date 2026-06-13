import { type User } from "../../../types/types.js";
import { Leaderboard } from "../leaderboard/Leaderboard.js";
import { OtherProfileSearch } from "./FindProfile.js";
import { Profile } from "./ProfileCard.js";
// import './ProfilePage.css'

interface ProfileProps {
	user: User;
	onUserUpdated?: () => Promise<void> | void;
}

export function ProfilePage({ user, onUserUpdated }: ProfileProps) {
	return (
    <div className="profile-page">
		<Profile user={user} {...(onUserUpdated ? { onUserUpdated } : {})} />
		<Leaderboard />
		<OtherProfileSearch />
    </div>
	);
}