import './Game.css'
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LobbyPanel, Action1Panel, Action2Panel, ChatPanel, VotePanel, ResultPanel } from './panels'
import { roomStates, type VoteInfo } from './types';

function Game() {
    const [state, setState] = useState<roomStates>(roomStates.LOBBY);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);
    const [players, setPlayers] = useState<VoteInfo[]>([]);
    
    useEffect(() => {
        const s = io();
        setSocket(s);

        s.on('startLobby', ()        	=> setState(roomStates.LOBBY));
		s.on('startAction1', ()		=> setState(roomStates.ACTION_1));
		s.on('startAction2', (prompt)	=> {
            setState(roomStates.ACTION_2);
            setPrompt(prompt);
        });
        s.on('startChat', ()			=> setState(roomStates.CHAT));
        s.on('startVote', (players) 	=> {
            setState(roomStates.VOTE);
            setPlayers(players);
        });
        s.on('startResult', ()        	=> setState(roomStates.RESULT));

        return () => { s.disconnect(); };
    }, []);

    return (
        <div>
            {state === roomStates.LOBBY  && <LobbyPanel  socket={socket} />}
            {state === roomStates.ACTION_1 && <Action1Panel socket={socket} />}
            {state === roomStates.ACTION_2 && <Action2Panel socket={socket} prompt={prompt} />}
            {state === roomStates.CHAT && <ChatPanel socket={socket} />}
            {state === roomStates.VOTE   && <VotePanel   socket={socket} players={players} />}
            {state === roomStates.RESULT && <ResultPanel socket={socket} />}
        </div>
    );
}

export default Game;