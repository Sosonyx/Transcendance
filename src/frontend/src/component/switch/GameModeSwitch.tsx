import './Switch.css';
import { GameMode } from '../../types/types';

interface GameModeSwitchProps {
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
}

function GameModeSwitch({ gameMode, setGameMode }: GameModeSwitchProps) {
    return (
    <div className="switch-container-wrapper">
        <div className="switch-container">
            <label className={`mode-label mode-label--sub elimination ${gameMode === GameMode.ELIMINATION ? 'active' : ''}`}>
                <input
                    type="radio"
                    name="gameMode"
                    value={GameMode.ELIMINATION}
                    checked={gameMode === GameMode.ELIMINATION}
                    onChange={() => setGameMode(GameMode.ELIMINATION)}
                />
                Mode élimination
            </label>

            <label className={`mode-label mode-label--sub ${gameMode === GameMode.SCORE ? 'active' : ''}`}>
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
        <p className="mode-description">
            {gameMode === GameMode.ELIMINATION
                ? "Chaque round, le joueur le plus voté est éliminé. Survivez jusqu'à la fin ou éliminez toutes les IA !"
                : "Marquez des points en votant correctement contre l'IA ou en vous faisant passer pour elle. Le premier à atteindre l'objectif de score gagne."
            }
        </p>
    </div>
    );
}

export default GameModeSwitch;