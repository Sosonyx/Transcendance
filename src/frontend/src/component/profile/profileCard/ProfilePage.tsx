import { type User } from "../../../types/types.js";
import { Leaderboard } from "../leaderboard/Leaderboard.js";
import { OtherProfileSearch } from "./FindProfile.js";
import { Profile } from "./ProfileCard.js";
interface ProfileProps {
  user: User;
}

export function ProfilePage({user} : ProfileProps) {
	return (<>
	<div className="profile-page">
		<Profile user={user}/>
		<Leaderboard/>
		<OtherProfileSearch/>
	</div>
	</>)
}