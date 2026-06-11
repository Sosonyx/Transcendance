import { useState } from 'react'
import { type User } from '../../../types/types.js'
import { AuthModal } from '../../auth/AuthModal.js'
import './NavBar.css'

interface Props {
  user: User | null
  onLogout: () => void | Promise<void>
  onAuthSuccess: () => void | Promise<void>
  onViewChange: (view : 'home' | 'profile' | 'game') => void | Promise<void>
}

export function Navbar({ user, onLogout, onAuthSuccess, onViewChange}: Props) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <>
      <nav className='navbar'>
      <div className='navbar-left'>
        <img src="/logo.png" alt="Logo" className="navbar-logo" />
        <h5 onClick={() => onViewChange('home')} className='navbar-brand'>Qui est l'IA ?</h5>
      </div>

        {user ? (

          <div className='button-div'>
            <img src="/account.svg" alt="Profile" className="profile-edit-btn" onClick={() => onViewChange('profile')} />
            <button className='nav-button' onClick={() => {onLogout(); onViewChange('home')}}>Logout</button>
            <button className='play-btn'   onClick={() => onViewChange('game')}>Play</button>
          </div>
        ) : (
          <div className='button-div'>
            <img src="/account.svg" alt="Profile" className="profile-edit-btn" onClick={() => setShowAuthModal(true)} />
            <button className='play-btn' onClick={() => setShowAuthModal(true)}>Play</button>
          </div>
        )}
      </nav>
      
      {showAuthModal && !user && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            onAuthSuccess();
            setShowAuthModal(false);
          }}
        />
      )}
    </>
  );
}