import { type User } from "../../types/types.js";

interface ProfileProps{
	user : User;
}

export function Profile({ user }: ProfileProps) {
	return (<>
		<div>
			Email : {user.email}<br/> 
			Username : {user.username}<br/>
		</div>
	</>)
}