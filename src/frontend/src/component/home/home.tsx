// import { useState } from 'react'
import type { User } from '../../types/types.js';
import type { GameMode } from '../../types/types.js';
import { Footer } from '../layout/NavBar/Footer.js';
import GameModeSwitch from '../switch/GameModeSwitch.js';
// import { AuthModal } from '../../auth/AuthModal.js'
import './home.css';
import '../layout/NavBar/Footer.css';

interface HomeProps {
    user: User | null;
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
    onPlay: () => void;
    onAuthSuccess: () => void | Promise<void>

}

export function Home({ user, gameMode, setGameMode, onPlay, onAuthSuccess }: HomeProps) {
    return (
    <div className="home-page">
        <div className="home-hero">
            <h1 className="home-title">QUI EST L'<span className="blink-ia">IA</span> ?</h1>
            <p className="home-subtitle">Juste une discussion entre amis... ou peut-être pas.</p>
            <p className="home-desc">
                Une remarque étrange, une réponse décalée ?
                Trouvez qui parmi vous est une intelligence artificielle.
            </p>

            <div className="home-gamemode">
                <GameModeSwitch gameMode={gameMode} setGameMode={setGameMode} />
            </div>

            {user ? (
                <button className="home-play-btn" onClick={onPlay}>
                Jouer
                </button>
            ) : (
                <button className="home-play-btn" onClick={onAuthSuccess}>
                Jouer
                </button>
            )}
        </div>

        <div className="home-rules">
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Bipbip... discutez</h3>
                <p>Bipbip</p>
            </div>
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Bapbap... Analysez</h3>
                <p>Bapbap</p>
            </div>
            <div className="rule-card">
                <span className="rule-icon"></span>
                <h3>Boupboup</h3>
                <p>Boupboup</p>
            </div>
        </div>
        <Footer />
    </div>
    );
}

