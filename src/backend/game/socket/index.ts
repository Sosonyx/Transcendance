import { Server } from 'socket.io';
import { EventEmitter } from "node:events";
import { RoomManager } from '../game_logic/RoomManager.js';
import { roomStates } from '../game_logic/Room.js';
import { gameMode, type LobbyInfo, type Message , type RoomId, type SafeUser, type VoteInfo } from '../utils/index.js';
import { CLI } from '../game_logic/CommandLine.js';

export function registerSocketHandlers(io: Server) 
{
	const roomManager = new RoomManager();

	/* ===============Connexion client================= */
	io.on('connection', (socket) => {
		// console.log(`Joueur connecté : ${user.id}`);
		
		// Recupere la room
		const user: SafeUser = socket.handshake.auth.user;
		const gameMode: gameMode = socket.handshake.auth.gameMode;

		let [roomId, roomEmitter, playerEmitter, ingame] : [RoomId, EventEmitter, EventEmitter, boolean] = roomManager.connectPlayer(user, gameMode);

		// Rejoins sa room
		if (roomId !== null)
			socket.join(roomId);

		const stateDisplay = (state: string, data: undefined, timeinfo: number) => {
			if (roomId === null) return;
		    switch (state) {
				case roomStates.LOBBY: {
					socket.emit('startLobby');
					// console.log(`${roomId}: lobby phase, waiting for the players to be ready`);
					break;
				}
				case roomStates.ACTION_1: {
					socket.emit('startAction1', timeinfo);
					// console.log(`${roomId}: starting action_1 phase`);
					break ;
				}
				case roomStates.ACTION_2: {
					socket.emit('startAction2', data, timeinfo);
					break ;
				}

				case roomStates.CHAT: {
					socket.emit('startChat', data, timeinfo);
					// console.log(`${roomId}: starting action phase`);
					break;
				}
		        case roomStates.VOTE: {
		            socket.emit('startVote', data, timeinfo);
		            // socket.emit('startVote', roomManager.getVotePoolFromUser(roomId, user.id), timeinfo);
		            // console.log(`${roomId}: starting vote phase`);
		            break;
		        }
				case roomStates.RESULT: {
					socket.emit('startResult', timeinfo);
					// console.log(`${roomId}: result phase`)
					break;
				}
		        default: {
					// console.log(`Phase ${state} de room ${roomId} non reconnue`);
		            break;
		        }
		    }
		};

		// Changement d'etat de la room
		roomEmitter.on('stateChanged', stateDisplay);

		/* ==========LOBBY==========*/
		// Joueur pret
		socket.on('ready', () => {
			// TODO : still need to check the state ?
			// if (gamestate !== roomStates.LOBBY) return;
			// console.log(`Ready registered for roomId ${roomId}`);
			roomManager.onReadyEvent(user.id, roomId);
		});

		// Affichage des infos de room dans le lobby
		roomEmitter.on('lobby_info', (lobbyInfo: LobbyInfo) => {
			socket.emit('lobby_info', lobbyInfo);
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

		// Relay messages emitted on the roomEmitter to socket.io clients
		roomEmitter.on('message', (message: Message) => {
			if (roomId === null) return;
			socket.emit('message', message);
		});

		/* ==========VOTE==========*/
		// Joueur vote
		socket.on('vote', (playerId: string) => {
			if (roomManager.getRoomState(roomId) !== roomStates.VOTE) return;
			roomManager.onVoteEvent(user.id, playerId, roomId);
			// console.log(`${user.id} a vote pour ${playerId}`);
		});

		// Envoie les infos de vote
		roomEmitter.on('vote-info', (voteInfo: VoteInfo) => {
			socket.emit('vote-info', voteInfo);
		});

		/* ==========RESULT==========*/
		// Joueur appuie sur "replay"
		socket.on('replay', () => {
			if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
			roomManager.onReplayEvent(user.id, roomId);
			// console.log(`${user.id} rejoue dans sa room ${roomId}`);
		});

		// Joueur appuie sur "New game"
		socket.on('newGame', () => {
			if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
			roomManager.onDisconnectEvent(user.id, roomId);
			process.stdout.write(`${user.id} quitte la room ${roomId} pour `);
			if (roomId !== null)
			{
				socket.leave(roomId);
				roomEmitter.off('stateChanged', stateDisplay);
			}
			[roomId, roomEmitter, playerEmitter] = roomManager.connectPlayer(user, gameMode)
			if (roomId !== null)
			{
				socket.join(roomId);
				roomEmitter.on('stateChanged', stateDisplay);
			}
			process.stdout.write(`rejouer dans une nouvelle room ${roomId}\n`);
			socket.emit('startLobby');
		});

		// Timer pour replay fini
		playerEmitter.on('timedOut', () => {
			if (roomId === null) return;
			socket.emit('timedOut');
			socket.leave(roomId);
			roomManager.onDisconnectEvent(user.id, roomId);
			roomId = null;
		});

		/* ==========Deconnexion client==========*/
		// Joueur se deconnecte
		socket.on('disconnect', () => {
			roomManager.onDisconnectEvent(user.id, roomId);
			roomEmitter.off('stateChanged', stateDisplay);
			// console.log(`Joueur déconnecté : ${user.id}`);
		});

		// Joueur demande synchronization (game side)
		playerEmitter.on('synchronize', (state, data, timeout) => {
			stateDisplay(state, data, timeout);
		})

		if (ingame && roomId) {
			roomManager.askSynchronize(roomId, user.id);
		}
	});

	const CommandLineInterpreter = new CLI(roomManager);
    CommandLineInterpreter.run();
}