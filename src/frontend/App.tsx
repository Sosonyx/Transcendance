import { useAuth } from './hooks/useAuth.js';
import { Statusbar } from './component/layout/StatusBar/Statusbar.js'
import {Navbar} from './component/layout/NavBar/NavBar.js';
import { LoginForm } from './component/auth/LoginForm.js';
import { logout } from './services/api.js';
import { RegisterForm } from './component/auth/RegisterForm.js';
import { Profile } from './component/profile/ProfileCard.js';
import { OtherProfileSearch } from './component/profile/FindProfile.js';

export function App() {
  const { user, loading, isAuthenticated , refreshAuth } = useAuth();

  const handleLogout = async () => {
    await logout();
    await refreshAuth();
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {loading ? "Loading" : ""}
      {!user && <LoginForm onSuccess={refreshAuth} />}
      {!user && !isAuthenticated && <p>Pas de cookie token, merci de vous connecter.</p>}
      {!user && !isAuthenticated && <RegisterForm onSuccess={refreshAuth}/>}
      {user && isAuthenticated && <Profile user={user}/>}
      <OtherProfileSearch />
      <Statusbar user={user} onLogout={handleLogout} />
    </>
  )
}

