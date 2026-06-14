import { useAuth } from './hooks/useAuth.js';
import { Navbar } from './component/layout/NavBar/NavBar.js';
import { logout } from './services/api.js';
import { ProfilePage } from './component/profile/profileCard/ProfilePage.js';
import { useState } from 'react';
import Game from './Game.js';
import './App.css'
import GameModeSwitch from './component/switch/GameModeSwitch.js';
import RoomTypeSwitch from './component/switch/RoomTypeSwitch.js';
import CustomActionSwitch from './component/switch/CustomActionSwitch.js';
import { GameMode, RoomType, CustomAction } from './types/types.js';

export function App() {
  const { user, loading, isAuthenticated, refreshAuth } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'game'>('home');
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SCORE);

  const [roomType, setRoomType] = useState<RoomType>(RoomType.CLASSIC);
  const [customAction, setCustomAction] = useState<CustomAction>(CustomAction.CREATE);

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
		  <RoomTypeSwitch roomType={roomType} setRoomType={setRoomType} />
          
			{
				roomType === RoomType.CLASSIC && (
					<GameModeSwitch gameMode={gameMode} setGameMode={setGameMode} /> )
			}
			{
				roomType === RoomType.CUSTOM && (
					<CustomActionSwitch customAction={customAction} setCustomAction={setCustomAction} /> )
			}

        </div>
      )}

      {user && isAuthenticated && currentView === 'profile' && (
        <ProfilePage user={ user } onUserUpdated={refreshAuth} />
      )}

      {currentView === 'game' && user && (
        <Game user={user} gameMode={gameMode} roomType={roomType} customAction={customAction} />
      )}

    </>
  );
}