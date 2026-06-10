import React from 'react';
import './GameModeSwitch.css';
import { GameMode } from '../../types/types';

interface GameModeSwitchProps {
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
}

function GameModeSwitch({ gameMode, setGameMode }: GameModeSwitchProps) {
  return (
    <div className="game-mode-container">
        <label className={`mode-label ${gameMode === GameMode.ELIMINATION ? 'active' : ''}`}>
            <input
                type="radio"
                name="gameMode"
                value={GameMode.ELIMINATION}
                checked={gameMode === GameMode.ELIMINATION}
                onChange={() => setGameMode(GameMode.ELIMINATION)}
            />
            Mode élimination
        </label>

        <label className={`mode-label ${gameMode === GameMode.SCORE ? 'active' : ''}`}>
            <input
                type="radio"
                name="gameMode"
                value={GameMode.SCORE}
                checked={gameMode === GameMode.SCORE}
                onChange={() => setGameMode(GameMode.SCORE)}
            />
            Mode score
        </label>
    </div>
  );
}

export default GameModeSwitch;