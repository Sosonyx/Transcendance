import React from 'react';
import './GameModeSwitch.css';
import { GameMode } from '../../types/types';

interface GameModeSwitchProps {
    gameMode: GameMode;
    setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
}

function GameModeSwitch({ gameMode, setGameMode }: GameModeSwitchProps) {
  const isScoreMode = gameMode === 'SCORE';

  const toggleMode = () => {
    setGameMode(isScoreMode ? GameMode.ELIMINATION : GameMode.SCORE);
  };

  return (
    <div className="game-mode-container">
      <span className={`mode-label ${!isScoreMode ? 'active' : ''}`}>
        Mode élimination
      </span>

      <label className="switch">
        <input 
          type="checkbox" 
          checked={isScoreMode} 
          onChange={toggleMode} 
        />
        <span className="slider"></span>
      </label>

      <span className={`mode-label ${isScoreMode ? 'active' : ''}`}>
        Mode score
      </span>
    </div>
  );
}

export default GameModeSwitch;