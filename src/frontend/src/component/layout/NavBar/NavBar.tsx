import { type User } from '../../../types/types.js'
import './NavBar.css'

interface Props {
  user: User | null
  onLogout: () => void | Promise<void>
  setShowAuthModal: (show: boolean) => void | Promise<void>
  onViewChange: (view : 'home' | 'profile' | 'game') => void | Promise<void>
}

export function Navbar({ user, onLogout, setShowAuthModal, onViewChange}: Props) {
  return (
    <>
      <nav className='navbar'>
        <div className='navbar-left'>
          <img onClick={() => onViewChange('home')} src="/logo.png" alt="Logo" className="navbar-logo" />
          <h5 onClick={() => onViewChange('home')} className='navbar-brand'>
            Qui est l'IA<span className="navbar-brand-q">?</span>
            <span className="navbar-brand-line"></span>
          </h5>
        </div>

        {user ? (
          <div className='button-div'>
            <div className='navbar-user-info' onClick={() => onViewChange('profile')}>
              <img
                className='navbar-avatar'
                src={user.avatar && user.avatar.trim() !== '' ? user.avatar : '/username.png'}
                alt="avatar"
              />
              <span className='navbar-username'>{user.username}</span>
            </div>
            <button className='nav-button' onClick={() => {onLogout(); onViewChange('home')}}>Logout</button>
            <button className='play-btn' onClick={() => onViewChange('game')}>JOUER</button>
          </div>
        ) : (
          <div className='button-div'>
            <img src="/account.svg" alt="Profile" className="navbar-account-icon" onClick={() => setShowAuthModal(true)} />
            <button className='play-btn' onClick={() => setShowAuthModal(true)}>JOUER</button>
          </div>
        )}
      </nav>
    </>
  );
}