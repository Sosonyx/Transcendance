import type { RoundResultInfo } from "../../types/types";
import { useEffect, useState } from "react";
import './RoundResultPanel.css'

interface RoundResultPanelProps {
	roundResult: RoundResultInfo;
}

function RoundResultPanel ({ roundResult }: RoundResultPanelProps) {
	const [revealed, setRevealed] = useState<boolean[]>(
        new Array(roundResult._players.length).fill(false)
    );

    useEffect(() => {
        roundResult._players.forEach((_, i) => {
            setTimeout(() => {
                setRevealed(prev => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                });
            }, 1200 + i * 600); // au bout de 1,2s toutes les 0,6s on devoile une carte
        });
    }, []);

    return (
        <div className="round-result-layout">
            <h2 className="round-result-title">Résultats du vote</h2>
            <div className="round-result-grid">
                {roundResult._players.map(([login, name, isLlm], i) => (
                    <div key={i} className={`result-card ${revealed[i] ? 'revealed' : ''}`}>
                        <div className="result-card-inner">

                            {/* Front — nom du joueur pendant la partie */}
                            <div className="result-card-front">
                                <img
                                    src="/avatars/avatar.png"
                                    alt={name}
                                    className="result-avatar"
                                />
                                <p className="result-name">{name}</p>
                                <p className="result-hint">?</p>
                            </div>

                            {/* Back — identité réelle */}
                            <div className={`result-card-back ${isLlm ? 'is-llm' : ''}`}>
                                <img
                                    src={isLlm ? "/avatars/llm-avatar.png" : "/avatars/avatar.png"}
                                    alt={login}
                                    className="result-avatar"
                                />
                                <p className="result-login">{isLlm ? 'IA 🤖' : login}</p>
                                <p className="result-name-was">{name}</p>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoundResultPanel;