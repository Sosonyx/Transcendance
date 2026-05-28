import { useAuth } from './hooks/useAuth.js';
import { Statusbar } from './component/layout/StatusBar/Statusbar.js'
import {Navbar} from './component/layout/NavBar/NavBar.js';
import { LoginForm } from './component/auth/LoginForm.js';
import { logout } from './services/api.js';
import { RegisterForm } from './component/auth/RegisterForm.js';

export function App() {
  const { user, loading, isAuthenticated ,refreshAuth } = useAuth();

  const handleLogout = async () => {
    await logout();
    await refreshAuth();
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {!user && <LoginForm onSuccess={refreshAuth} />}
      {loading ? "Loading..." : "Connected"}
      {!user && !isAuthenticated && <p>Pas de cookie token, merci de vous connecter.</p>}
      {!user && !isAuthenticated && <RegisterForm onSuccess={refreshAuth}/>}
      {/* {user && isAuthenticated && <Profile user={user}/>} */}
      <Statusbar user={user} onLogout={handleLogout} />
    </>
  )
}

