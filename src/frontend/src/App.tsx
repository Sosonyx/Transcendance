import { useAuth } from './hooks/useAuth.js';
import { Navbar } from './component/layout/NavBar/NavBar.js';
import { logout } from './services/api.js';
import { ProfilePage } from './component/profile/profileCard/ProfilePage.js';
import { useEffect, useState } from 'react';
import Game from './Game.js';
import './App.css'
import { Home } from './component/home/home.js';
import { AuthModal } from './component/auth/AuthModal.js';
import { GameMode, RoomType, CustomAction } from './types/types.js';

type View = 'home' | 'profile' | 'game';

const getViewFromHash = () : View => {
  const hashed = window.location.hash.replace('#', '');
  return hashed === 'profile' ? 'profile' : hashed === 'game' ? 'game' : 'home';
}

export function App() {
  const { user, loading, isAuthenticated, refreshAuth } = useAuth();
  const [currentView, setCurrentView] = useState<View>(getViewFromHash());
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SCORE);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [roomType, setRoomType] = useState<RoomType>(RoomType.CLASSIC);
  const [customAction, setCustomAction] = useState<CustomAction>(CustomAction.CREATE);

  const handleViewChange = (view: View) => { 
    window.location.hash = view;
    setCurrentView(view);
  };

  const handleLogout = async () => {
    await logout();
    await refreshAuth();
  };

  useEffect(() => {
    const handlePopState = () => setCurrentView(getViewFromHash());
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div>
        Chargement...
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} setShowAuthModal={setShowAuthModal} onViewChange={handleViewChange}/>
      
      {currentView === 'home' && (
          <Home
            user={user}
            gameMode={gameMode}
            setGameMode={setGameMode}
            onViewChange={handleViewChange}
            setShowAuthModal={setShowAuthModal}
            roomType={roomType}
            setRoomType={setRoomType}
            customAction={customAction}
            setCustomAction={setCustomAction}
          />
      )}

      {user && isAuthenticated && currentView === 'profile' && (
        <ProfilePage user={ user } onUserUpdated={refreshAuth} />
      )}

      {currentView === 'game' && user && (
        <Game user={user} gameMode={gameMode} roomType={roomType} customAction={customAction} />
      )}
      {showAuthModal && !user && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            refreshAuth();
            setShowAuthModal(false);
          }}
        />
      )}
    </>
  );
}