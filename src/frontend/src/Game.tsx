import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LobbyPanel, Action1Panel, Action2Panel, ChatPanel, VotePanel, ResultPanel } from './component/panels'
import { TransitionOverlay } from './component/transitions';
import { roomStates, type VoteInfo, type AnswersType } from './types/types';
import './index.css'
import type { User } from './types/types';

interface GameProps {
    user: User;
}

function Game({ user } : GameProps) {
    const [state, setState] = useState<roomStates>(roomStates.LOBBY);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);
    const [players, setPlayers] = useState<VoteInfo[]>([]);
    const [question, setQuestion] = useState<string | undefined>('');
    const [answers, setAnswers] = useState<AnswersType>([]);
    const [transition, setTransition] = useState<string | null>(null);

    const showTransition = (message: string, callback: () => void) => {
        setTransition(message);
        setTimeout(() => {
            setTransition(null);
            callback();
        }, 2000);
    };
    
    useEffect(() => {
        const s = io(undefined, {
            auth: {
                userId: user.id
            }
        });
        setSocket(s);

        s.on('startLobby', () => setState(roomStates.LOBBY));
		s.on('startAction1', () => setState(roomStates.ACTION_1));
		s.on('startAction2', (prompt: string) => {
            setPrompt(prompt);
            setState(roomStates.ACTION_2);
        });
        s.on('startChat', (data: { question: string | undefined, answers: AnswersType })			=> {
            setQuestion(data.question);
            setAnswers(data.answers);
            showTransition('La discussion commence !', () => {
                setState(roomStates.CHAT);
            });
        });
        s.on('startVote', (players: VoteInfo[]) 	=> {
            setPlayers(players);
            showTransition('Votez !', () => {
                setState(roomStates.VOTE);
            });
        });
        s.on('startResult', ()        	=> setState(roomStates.RESULT));

        return () => { s.disconnect(); };
    }, []);

    return (
        <div>
            {transition ? (
                <TransitionOverlay config={transition} />
            ) : (<>
                {state === roomStates.LOBBY  && <LobbyPanel  socket={socket} />}
                {state === roomStates.ACTION_1 && <Action1Panel socket={socket} />}
                {state === roomStates.ACTION_2 && <Action2Panel socket={socket} prompt={prompt} />}
                {state === roomStates.CHAT && <ChatPanel socket={socket} question={question} answers={answers}/>}
                {state === roomStates.VOTE   && <VotePanel   socket={socket} players={players} />}
                {state === roomStates.RESULT && <ResultPanel socket={socket} />}
            </>)}
        </div>
    );
}

export default Game;