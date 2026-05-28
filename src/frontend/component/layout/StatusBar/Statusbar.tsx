import type { User } from "../../../types/types.js"

export function Statusbar({ user, onLogout }: { user: User | null, onLogout: () => void | Promise<void> }){
	return (
		<div>
			{user ? (<p>Connecte : {user.username}</p>) : (<p>Non connecte</p>)}
			{user && <button onClick={onLogout}>Logout</button>}
		</div>
	)
}