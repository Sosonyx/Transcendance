import { type User } from "../../../types/types.js";
import { Leaderboard } from "../leaderboard/Leaderboard.js";
import { OtherProfileSearch } from "./FindProfile.js";
import { Profile } from "./ProfileCard.js";
interface ProfileProps {
	user: User;
	onUserUpdated?: () => Promise<void> | void;
}

export function ProfilePage({ user, onUserUpdated }: ProfileProps) {
	return (
    <div className="profile-page">
		<Profile user={user} {...(onUserUpdated ? { onUserUpdated } : {})} />
	<div className="profile-middle" />
		<Leaderboard />
	<div className="profile-right">
		<OtherProfileSearch />
	</div>
	</div>
	);
}