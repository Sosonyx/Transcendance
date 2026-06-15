import { GameMode } from '../../types/types';
import GameModeSwitch from '../switch/GameModeSwitch';
import SliderInput from '../slider/SliderInput';
import { useState } from 'react';
import type { Socket } from 'socket.io-client';
import './GameConfigPanel.css';

export interface GameConfig {
	gameMode: GameMode;
	chatTime: number;
	voteTime: number;
	maxPlayerCount: number;
	scoreObjective: number;
	eliminationThreshold: number;
	llmNumber: number;
}

interface GameConfigPanelProps { socket : Socket | null }

function GameConfigPanel( { socket } : GameConfigPanelProps ) {
	const [config, setConfig] = useState<GameConfig>({
		gameMode: GameMode.SCORE,
		chatTime: 30,
		voteTime: 30,
		maxPlayerCount: 8,
		scoreObjective: 10,
		eliminationThreshold: 1,
		llmNumber: 1
	});

	const set = (key: keyof GameConfig) => (value:number) =>
		setConfig(prev => ({ ...prev, [key]: value }));

	const sendConfig = async () => { 
		try {
			const ack = await socket?.timeout(5000).emitWithAck('config', config);
			console.log('\n\n\n ACK : ');
			console.log(ack); 
		}
		catch {}
	};


	return (
		<div className="config-panel">
			<GameModeSwitch
				gameMode={config.gameMode}
				setGameMode={(mode: GameMode) => setConfig(prev => ({ ...prev, gameMode: mode }))}
			/>
			<SliderInput label="Joueur max"			value={config.maxPlayerCount} min={2} max={100} step={1} onChange={set('maxPlayerCount')} />
			<SliderInput label="IAs dans la partie" value={config.llmNumber} min={0} max={100} step={1} onChange={set('llmNumber')} />

			{config.gameMode === GameMode.SCORE && (
				<SliderInput label="Objectif de score" value={config.scoreObjective} min={1} max={100} step={5} onChange={set('scoreObjective')} />
			)}
			{config.gameMode === GameMode.ELIMINATION && (
				<SliderInput label="Seuil d'elimination" value={config.eliminationThreshold} min={1} max={config.maxPlayerCount} step={1} onChange={set('eliminationThreshold')} />
			)}
			<SliderInput label="Temps de chat"		value={config.chatTime}	min={10} max={120} step={5} onChange={set('chatTime')} />
			<SliderInput label="Temps de vote"		value={config.voteTime}	min={10} max={120} step={5} onChange={set('voteTime')} />
			<button onClick={sendConfig}>Enregistrer</button>
		</div>
	);
}

export default GameConfigPanel;