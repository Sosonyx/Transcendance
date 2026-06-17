import { Server } from 'socket.io';
import { EventEmitter } from "node:events";
import { RoomManager } from '../game_logic/RoomManager.js';
import { roomStates } from '../game_logic/Room.js';
import { GameMode, RoomType, CustomAction, type LobbyInfo, type Message , type RoomId, type SafeUser, type ScoreInfo, type VoteInfo, type GameConfig } from '../utils/index.js';
import { CLI } from '../game_logic/CommandLine.js';

export function registerSocketHandlers(io: Server) 
{
	const roomManager = new RoomManager();

	/* ===============Connexion client================= */
	io.on('connection', (socket) => {
		// console.log(`Joueur connecté : ${user.id}`);
		const gameConnect = () => {
			// Recupere la room
			const user: SafeUser = socket.handshake.auth.user;
			const gameMode: GameMode = socket.handshake.auth.gameMode;
			const roomType: RoomType = socket.handshake.auth.roomType;
			const customAction: CustomAction = socket.handshake.auth.customAction;

			let [roomId, roomEmitter, playerEmitter] : [RoomId, EventEmitter, EventEmitter] = roomManager.connectPlayer(user, gameMode, roomType, customAction);

			// Rejoins sa room
			if (roomId !== null)
				socket.join(roomId);


			/* ========== ROOM EMITTED EVENTS ==========*/

			
			const stateDisplay = (state: string, data: undefined, timeinfo: number) => {
				if (roomId === null) return;
				switch (state) {

					case roomStates.LOBBY: {
						socket.emit('startLobby'); break; }

					case roomStates.ACTION_1: {
						socket.emit('startAction1', timeinfo); break ; }

					case roomStates.ACTION_2: { 
						socket.emit('startAction2', data, timeinfo); break ; }

					case roomStates.CHAT: { 
						socket.emit('startChat', data, timeinfo); break; }

					case roomStates.VOTE: {
						socket.emit('startVote', data, timeinfo); break; }

					case roomStates.ROUND_RESULT: {
						socket.emit('startRoundResult', data, timeinfo); break; }

					case roomStates.RESULT: {
						socket.emit('startResult', data, timeinfo); break; }

					default: { break; } 
				}
			};

			const onScoreInfo	= (scoreInfo : ScoreInfo) 	=> socket.emit('score_info', scoreInfo);
			const onLobbyInfo	= (lobbyInfo : LobbyInfo) 	=> socket.emit('lobby_info', lobbyInfo);
			const onVoteInfo	= (voteInfo : VoteInfo)		=> socket.emit('vote_info', voteInfo);
			const onMessage		= (message : Message)		=> socket.emit('message', message);

			const connectRoomEvents = () => {
				roomEmitter.on('stateChanged',	stateDisplay);
				roomEmitter.on('score_info', 	onScoreInfo);
				roomEmitter.on('lobby_info',	onLobbyInfo);
				roomEmitter.on('vote_info', 	onVoteInfo);
				roomEmitter.on('message', 		onMessage);
			}

			const cleanUpRoomEvents = () => {
				roomEmitter.off('stateChanged',	stateDisplay);
				roomEmitter.off('lobby_info',	onLobbyInfo);
				roomEmitter.off('score_info',	onScoreInfo);
				roomEmitter.off('vote_info',	onVoteInfo);
				roomEmitter.off('message',		onMessage);
			}

			connectRoomEvents();


			/* ========== PLAYER EMITTED EVENTS ==========*/

			const onTimeOut	= () => {
				if (roomId === null) return;
				socket.emit('timedOut');
				socket.leave(roomId);
				roomManager.onDisconnectEvent(user.id, roomId);
				roomId = null;
			};

			const onSynchronize = (state : roomStates, data : any, timeout : number, scoreInfo : ScoreInfo) => {
				stateDisplay(state, data, timeout);
				onScoreInfo(scoreInfo);
				console.log(scoreInfo);
			}

			const connectPlayerEvents = () => {
				playerEmitter.on('timedOut',	onTimeOut);
				playerEmitter.on('synchronize', onSynchronize);
			}

			const cleanUpPlayerEvents = () => {
				playerEmitter.off('timedOut',		onTimeOut)
				playerEmitter.off('synchronize',	onSynchronize)
			}

			connectPlayerEvents();


			/* ==========LOBBY==========*/

			// Joueur pret
			socket.on('ready', () => {roomManager.onReadyEvent(user.id, roomId);
			});

			// Envoi de la config en mode custom
			socket.on('config', (config: GameConfig, callback) => {
				
				let check = roomManager.onConfig(user.id, roomId, config);
				if (!check)	callback({ status : 'error'});
				else 		callback({ status : 'ok'});
			});

			/* ==========ACTION_1==========*/

			// Joueur interragit action_1
			socket.on('input', (content: string) => {
				// console.log(`socket backend received an input info !`);
				if (roomId === null) return;
				if (roomManager.getRoomState(roomId) !== roomStates.ACTION_1 && roomManager.getRoomState(roomId) !== roomStates.ACTION_2 ) return;
				if (typeof content !== 'string') return;
				if (content.trim() === '') return;
				if (content.length > 500) return;
				
				roomManager.onInputEvent(user.id, roomId, content);
			});

			/* ==========CHAT==========*/

			// Joueur envoie un message
			socket.on('message', (content: string) => {
				if (roomId === null) return;
				if (roomManager.getRoomState(roomId) !== roomStates.CHAT) return;
				if (typeof content !== 'string') return;
				if (content.trim() === '') return;
				if (content.length > 500) return;
				
				roomManager.onChatEvent(user.id, roomId, content);
			});

			/* ==========VOTE==========*/

			// Joueur vote
			socket.on('vote', (playerId: string) => {
				if (roomManager.getRoomState(roomId) !== roomStates.VOTE) return;
				roomManager.onVoteEvent(user.id, playerId, roomId);
			});

			/* ==========RESULT==========*/

			// Joueur appuie sur "replay"
			socket.on('replay', () => {
				if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
				roomManager.onReplayEvent(user.id, roomId);
			});

			// Joueur appuie sur "New game"
			socket.on('newGame', () => {
				if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
				roomManager.onDisconnectEvent(user.id, roomId);
				process.stdout.write(`${user.id} quitte la room ${roomId} pour `);
				if (roomId !== null)
				{
					socket.leave(roomId);

					cleanUpRoomEvents();
					cleanUpPlayerEvents();
				}
				[roomId, roomEmitter, playerEmitter] = roomManager.connectPlayer(user, gameMode, roomType, CustomAction.CREATE)
				if (roomId !== null)
				{
					socket.join(roomId);

					connectRoomEvents();
					connectPlayerEvents();
				}
				process.stdout.write(`rejouer dans une nouvelle room ${roomId}\n`);
				socket.emit('startLobby');
			});

			/* ==========Deconnexion client==========*/

			// Joueur se deconnecte

			socket.on('disconnect', () => {
				roomManager.onDisconnectEvent(user.id, roomId);
				cleanUpRoomEvents();
				cleanUpPlayerEvents();
			});

			if (roomId) {
				roomManager.askSynchronize(roomId, user.id);
			}
		}
		socket.on('startGame', gameConnect);
	});

	const CommandLineInterpreter = new CLI(roomManager);
    CommandLineInterpreter.run();
}