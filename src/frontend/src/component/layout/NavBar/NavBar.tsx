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
        <h1 onClick={() => onViewChange('home')} className='navbar-brand'>Qui est l'IA ?</h1>

        {user ? (
          <div className='button-div'>
            <button className='nav-button' onClick={() => onViewChange('profile')}>Profile Page</button>
            <button className='nav-button' onClick={() => onViewChange('game')}>Play</button>
            <button className='nav-button' onClick={() => {onLogout(); onViewChange('home')}}>Déconnexion</button>
          </div>
        ) : (
          <button className='nav-button' onClick={() => setShowAuthModal(true)}>Connexion</button>
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