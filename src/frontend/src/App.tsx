import { useAuth } from './hooks/useAuth.js';
import { Navbar } from './component/layout/NavBar/NavBar.js';
import { logout } from './services/api.js';
import { ProfilePage } from './component/profile/profileCard/ProfilePage.js';
import { useState } from 'react';
import Game from './Game.js';
import './App.css'

export function App() {
  const { user, loading, isAuthenticated, refreshAuth } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'game'>('home');
  const handleLogout = async () => {
    await logout();
    await refreshAuth();
  };

  if (loading) {
    return (
      <div>
        Chargement...
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} onAuthSuccess={refreshAuth} onViewChange={setCurrentView}/>
      
      {currentView === 'home' && (
        <div className='description'>
          <p>Welcome to Transcendence.</p>
        </div>
      )}

      {user && isAuthenticated && currentView === 'profile' && (
        <ProfilePage user={ user } onUserUpdated={refreshAuth} />
      )}
      {currentView === 'game' && user && <Game user={user} />}
      </>
  );
}