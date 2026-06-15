import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LobbyPanel, Action1Panel, Action2Panel, ChatPanel, VotePanel, RoundResultPanel, ResultPanel } from './component/panels'
import { TransitionOverlay } from './component/transitions';
import { roomStates, type VoteInfo, type AnswersType } from './types/types';
import './Game.css'
import { GameMode, RoomType, CustomAction, type ResultInfo, type RoundResultInfo, type User } from './types/types';
import Timer from './component/timer/Timer';
import ScoreBoard from './component/scoreboard/ScoreBoard';

type MobileTab = 'chat' | 'vote' | 'score';

interface GameProps {
    user: User;
    gameMode: GameMode;
	roomType: RoomType;
	customAction: CustomAction;
}

function Game({ user, gameMode, roomType, customAction } : GameProps) {
    const [state, setState] = useState<roomStates>(roomStates.LOBBY);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [timeEnd, setTimeEnd] = useState<number | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);
    const [players, setPlayers] = useState<VoteInfo[]>([]);
    const [question, setQuestion] = useState<string | undefined>('');
    const [answers, setAnswers] = useState<AnswersType>([]);
    const [transition, setTransition] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<MobileTab>('chat');
    const [roundResult, setRoundResult] = useState<RoundResultInfo>({ _players: [] });
    const [result, setResult] = useState<ResultInfo>({ _players: [] });
    const [eliminated, setEliminated] = useState<boolean>(false);

    const isVotePhase = state === roomStates.VOTE;
    const isLobbyPhase = state === roomStates.LOBBY;
    const isChatOrVote = state === roomStates.CHAT || state === roomStates.VOTE;

    const showTransition = (message: string, callback: () => void) => {
        callback();
        setTransition(message);
        setTimeout(() => {
            setTransition(null);
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

                gameMode: gameMode,
				roomType: roomType,
				customAction: customAction
            }
        });
        setSocket(s);

        s.on('startLobby', () => {
            setTimeEnd(null);
            setState(roomStates.LOBBY);
        });
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
        s.on('startRoundResult', (roundResult: RoundResultInfo, timeInfo: number | null) => {
            setRoundResult(roundResult);
            setTimeEnd(timeInfo);
            setState(roomStates.ROUND_RESULT);
        });
        s.on('startResult', (result: ResultInfo, timeInfo: number | null) => {
            console.log('[startResult]', result);
            setResult(result);
            setTimeEnd(timeInfo);
            setState(roomStates.RESULT)
        });

        return () => { s.disconnect(); };
    }, []);

    // Reset tab si on quitte la phase de vote
    useEffect(() => {
        if (!isVotePhase && mobileTab === 'vote') setMobileTab('chat');
    }, [state]);

    return (
        <div className="game-wrapper">

            {/* Tabs — cachés sur desktop */}
            <div className="mobile-tabs">
                <button className={`tab-btn ${mobileTab === 'chat' ? 'active' : ''}`} onClick={() => setMobileTab('chat')} type="button">💬 Chat</button>
                {isVotePhase && <button className={`tab-btn ${mobileTab === 'vote' ? 'active' : ''}`} onClick={() => setMobileTab('vote')} type="button">🗳️ Vote</button>}
                {!isLobbyPhase && <button className={`tab-btn ${mobileTab === 'score' ? 'active' : ''}`} onClick={() => setMobileTab('score')} type="button">🏆 Score</button>}
            </div>

            {/* Timer mobile chat tab */}
            <div className={`mobile-chat-timer ${mobileTab !== 'chat' ? 'mobile-hidden' : ''}`}>
                <Timer timeEnd={timeEnd} />
            </div>

            {/* Game container — caché sur mobile si tab !== chat */}
            <div className={`game-container ${mobileTab !== 'chat' ? 'mobile-hidden' : ''}`}>
                {transition && <TransitionOverlay config={transition} />}
                {state === roomStates.LOBBY        && <LobbyPanel   socket={socket} isCustom={roomType === RoomType.CUSTOM && customAction === CustomAction.CREATE} />}
                {state === roomStates.ACTION_1     && <Action1Panel socket={socket} eliminated={eliminated} />}
                {state === roomStates.ACTION_2     && <Action2Panel socket={socket} prompt={prompt} eliminated={eliminated} />}
                {isChatOrVote                      && <ChatPanel    socket={socket} question={question} answers={answers} eliminated={eliminated} />}
                {state === roomStates.ROUND_RESULT && <RoundResultPanel roundResult={roundResult} />}
                {state === roomStates.RESULT       && <ResultPanel  socket={socket} username={user.username} result={result} />}
            </div>

            {/* Side panel */}
            {!isLobbyPhase && 
                <div className={`side-panel ${mobileTab === 'chat' ? 'mobile-hidden' : ''}`}>

                    <Timer timeEnd={timeEnd} />

                    {/* VotePanel — visible sur desktop si vote, sur mobile si tab=vote */}
                    {isVotePhase && (
                        <div className={`side-vote-content ${mobileTab !== 'vote' ? 'mobile-hidden' : ''}`}>
                            <VotePanel socket={socket} players={players} userId={user.id} eliminated={eliminated} />
                        </div>
                    )}

                    {/* ScoreBoard — caché sur desktop si vote, visible sur mobile si tab=score */}
                    <div className={`side-score-content ${isVotePhase ? 'desktop-hidden' : ''} ${mobileTab !== 'score' ? 'mobile-hidden' : ''}`}>
                        <ScoreBoard socket={socket} username={user.username} setEliminated={setEliminated} />
                    </div>

                </div>
            }

        </div>
    );
}

export default Game;