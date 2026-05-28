import { type  User } from '../../../types/types.js'

interface Props {
  user: User | null
  onLogout: () => void | Promise<void>
}

export function Navbar({ user, onLogout }: Props) {
  return (
    <nav>
      <span>Transcendance</span>

      {user ? (
        <>
          <span>{user.username}</span>
          <button onClick={onLogout}>Déconnexion</button>
        </>
      ) : (
		<span>Non connecté</span>
      )}
    </nav>
  )
}
