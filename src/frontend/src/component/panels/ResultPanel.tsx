import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import './ResultPanel.css';
import type { ResultInfo } from "../../types/types";

interface ResultPanelProps {
    socket: Socket | null;
    username: string;
    result: ResultInfo;
}

function ResultPanel({ socket, username, result }: ResultPanelProps) {
    const [timedOut, setTimedOut] = useState<boolean>(false);
    const [clicked, setClicked]   = useState<boolean>(false);

    const winners  = result._players ?? [];
    const userWon  = winners.some(([login]) => login === username);
    const aiWon    = winners.length > 0 && winners.every(([, isLlm]) => isLlm);

    // Confetti générés une seule fois
    const [confetti] = useState(() =>
        Array.from({ length: 60 }, () => ({
            x:        Math.random() * 100,
            delay:    Math.random() * 2.5,
            duration: 2.5 + Math.random() * 2,
            color:    `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
            rotation: Math.random() * 360,
            size:     6 + Math.random() * 8,
            round:    Math.random() > 0.5,
        }))
    );

    const handleReplay  = () => { socket?.emit('replay');   setClicked(true); };
    const handleNewGame = () => { socket?.emit('newGame');  setClicked(true); };

    useEffect(() => {
        if (!socket) return;
        socket.on('timedOut', () => setTimedOut(true));
        return () => { socket.off('timedOut'); };
    }, [socket]);

    return (
        <div className={`result-layout ${aiWon ? 'ai-wins' : userWon ? 'user-wins' : 'user-loses'}`}>

            {/* Confetti si le joueur a gagné */}
            {userWon && !aiWon && (
                <div className="confetti-container">
                    {confetti.map((c, i) => (
                        <div
                            key={i}
                            className="confetti-piece"
                            style={{
                                left:             `${c.x}%`,
                                animationDelay:   `${c.delay}s`,
                                animationDuration:`${c.duration}s`,
                                background:       c.color,
                                width:            `${c.size}px`,
                                height:           `${c.size}px`,
                                borderRadius:     c.round ? '50%' : '2px',
                                transform:        `rotate(${c.rotation}deg)`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Scanlines si IA gagne */}
            {aiWon && <div className="scanlines" />}

            <h1 className="result-title">
                {aiWon    ? "L'IA a gagné"  :
                 userWon  ? "Vous avez gagné !"  :
                            "Vous avez perdu"}
            </h1>

			<h2 className="result-subtitle">Gagnants</h2>
            <div className="result-winners">
                {winners.map(([login, isLlm], i) => (
                    <div key={i} className={`winner-card ${isLlm ? 'llm-winner' : ''} ${login === username ? 'self-winner' : ''}`}>
                        <img
                            src={isLlm ? "/avatars/llm-avatar.png" : "/avatars/avatar.png"}
                            alt={login}
                            className="winner-avatar"
                        />
                        <p>{isLlm ? 'IA' : login}</p>
                        {login === username && <span className="self-tag">Vous</span>}
                    </div>
                ))}
            </div>

            <div className="result-actions">
                <button id="replay-btn"   className="game-button" onClick={handleReplay}  disabled={timedOut || clicked}>Rejouer</button>
                <button id="new-game-btn" className="game-button" onClick={handleNewGame} disabled={clicked}>Nouvelle partie</button>
            </div>

        </div>
    );
}

export default ResultPanel;