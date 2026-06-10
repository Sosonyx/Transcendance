import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LobbyPanel, Action1Panel, Action2Panel, ChatPanel, VotePanel, ResultPanel } from './component/panels'
import { TransitionOverlay } from './component/transitions';
import { roomStates, type VoteInfo, type AnswersType } from './types/types';
import './Game.css'
import type { GameMode, User } from './types/types';

interface GameProps {
    user: User;
    gameMode: GameMode;
}

function Game({ user, gameMode } : GameProps) {
    const [state, setState] = useState<roomStates>(roomStates.LOBBY);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [timeEnd, setTimeEnd] = useState<number | null>(null);
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
                user: { 
                    id: user.id, 
                    username: user.username, 
                    avatar: user.avatar 
                },
                gameMode: gameMode
            }
        });
        setSocket(s);

        s.on('startLobby', () => setState(roomStates.LOBBY));
		s.on('startAction1', (timeInfo: number | null) => {
            setTimeEnd(timeInfo);
            showTransition('Round 1', () => {
                setState(roomStates.ACTION_1);
            });
        });
		s.on('startAction2', (prompt: string, timeInfo: number | null) => {
            setTimeEnd(timeInfo);
            setPrompt(prompt);
            setState(roomStates.ACTION_2);
        });
        s.on('startChat', (data: { question: string | undefined, answers: AnswersType }, timeInfo: number | null)			=> {
            setTimeEnd(timeInfo);
            setQuestion(data.question);
            setAnswers(data.answers);
            showTransition('La discussion commence !', () => {
                setState(roomStates.CHAT);
            });
        });
        s.on('startVote', (players: VoteInfo[], timeInfo: number | null) => {
            setTimeEnd(timeInfo);
            setPlayers(players);
            showTransition('Votez !', () => {
                setState(roomStates.VOTE);
            });
        });
        s.on('startResult', (timeInfo: number | null) => {
            setTimeEnd(timeInfo);
            setState(roomStates.RESULT)
        });

        return () => { s.disconnect(); };
    }, []);

    return (
        <div>
            {transition ? (
                <TransitionOverlay config={transition} />
            ) : (<>
                {state === roomStates.LOBBY  && <LobbyPanel  socket={socket} />}
                {state === roomStates.ACTION_1 && <Action1Panel socket={socket} timeEnd={timeEnd} />}
                {state === roomStates.ACTION_2 && <Action2Panel socket={socket} timeEnd={timeEnd} prompt={prompt} />}
                {state === roomStates.CHAT && <ChatPanel socket={socket} timeEnd={timeEnd} question={question} answers={answers}/>}
                {state === roomStates.VOTE   && <VotePanel socket={socket} timeEnd={timeEnd} players={players} userId={user.id} />}
                {state === roomStates.RESULT && <ResultPanel socket={socket} timeEnd={timeEnd} />}
            </>)}
        </div>
    );
}

export default Game;