import type { User } from '../../types/types.js';
import type { GameMode } from '../../types/types.js';
import { Footer } from '../layout/NavBar/Footer.js';
import GameModeSwitch from '../switch/GameModeSwitch.js';
import './home.css';
import '../layout/NavBar/Footer.css';

interface HomeProps {
    user: User | null;
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
    setShowAuthModal: (show: boolean) => void | Promise<void>
    onViewChange: (view : 'home' | 'profile' | 'game') => void | Promise<void>
}

export function Home({ user, gameMode, setGameMode, onViewChange, setShowAuthModal }: HomeProps) {
    return (
    <div className="home-page">
        <div className="home-hero">
            <h1 className="home-title">QUI EST L'<span className="blink-ia">IA</span> ?</h1>
            <p className="home-subtitle">Juste une discussion entre humains... ou peut-être pas.</p>
            <p className="home-desc">
                Une remarque étrange, une réponse décalée ?
                Trouvez qui parmi vous est une intelligence artificielle.
            </p>
        </div>

        <div className="home-rules">
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Discutez</h3>
            </div>
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Analysez</h3>
            </div>
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Votez</h3>
            </div>
        </div>

        <div className="home-gamemode">
            <GameModeSwitch gameMode={gameMode} setGameMode={setGameMode} />
        </div>
        {user ? (
                <button className="home-play-btn" onClick={() => onViewChange('game')}>
                Jouer
                </button>
            ) : (
                <button className="home-play-btn" onClick={() => setShowAuthModal(true)}>
                Jouer
                </button>
            )}
        <Footer />
    </div>
    );
}

