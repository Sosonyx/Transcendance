import { Server } from 'socket.io';
import { EventEmitter } from "node:events";
import { RoomManager } from '../game_logic/RoomManager.js';
import { roomStates } from '../game_logic/Room.js';
import { type Message , type RoomId } from '../types/index.js';

import { CLI } from '../game_logic/CommandLine.js';

export function registerSocketHandlers(io: Server) {
	const roomManager = new RoomManager();

	/* ===============Connexion client================= */
	io.on('connection', (socket) => {
		console.log(`Joueur connecté : ${socket.id}`);

		// Recupere la room
		let [roomId, roomEmitter, playerEmitter] : [RoomId, EventEmitter, EventEmitter] = roomManager.connectPlayer(socket.id);
		// let gamestate : string = roomStates.LOBBY;

		// Rejoins sa room
		if (roomId !== null)
			socket.join(roomId);

		const onStateChanged = (state: string) => {
			if (roomId === null) return;
		    switch (state) {
				case roomStates.LOBBY: {
					io.to(roomId).emit('startLobby');
					console.log(`${roomId}: lobby phase, waiting for the players to be ready`);
					break;
				}
				case roomStates.ACTION: {
					io.to(roomId).emit('startAction');
					console.log(`${roomId}: starting action phase`);
					break;
				}
		        case roomStates.VOTE: {
		            io.to(roomId).emit('startVote', roomManager.getPlayersIdFromRoomId(roomId));
		            console.log(`${roomId}: starting vote phase`);
		            break;
		        }
				case roomStates.RESULT: {
					io.to(roomId).emit('startResult');
					console.log(`${roomId}: result phase`)
					break;
				}
		        default: {
					console.log(`Phase ${state} de room ${roomId} non reconnue`);
		            break;
		        }
		    }
		};

		// Changement d'etat de la room
		roomEmitter.on('stateChanged', onStateChanged);

		/* ==========LOBBY==========*/
		// Joueur pret
		socket.on('ready', () => {
			// TODO : still need to check the state ?
			// if (gamestate !== roomStates.LOBBY) return;
			console.log(`Ready registered for roomId ${roomId}`);
			roomManager.onReadyEvent(socket.id, roomId);
		});

		/* ==========ACTION==========*/
		// Joueur envoie un message
		socket.on('message', (content: string) => {
			if (roomId === null) return;
			if (roomManager.getRoomState(roomId) !== roomStates.ACTION) return;
			if (typeof content !== 'string') return;
			if (content.trim() === '') return;
			if (content.length > 500) return;
			
			roomManager.onChatEvent(socket.id, roomId, content);

			const message: Message = {
				senderId: socket.id,
				content,
				timestamp: Date.now()
			};
			io.to(roomId).emit('message', message);
		});

		/* ==========VOTE==========*/
		// Joueur vote
		socket.on('vote', (playerId: string) => {
			if (roomManager.getRoomState(roomId) !== roomStates.VOTE) return;
			roomManager.onVoteEvent(socket.id, playerId, roomId);
			console.log(`${socket.id} a vote pour ${playerId}`);
		});

		/* ==========RESULT==========*/
		// Joueur appuie sur "replay"
		socket.on('replay', () => {
			if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
			roomManager.onReplayEvent(socket.id, roomId);
			console.log(`${socket.id} rejoue dans sa room ${roomId}`);
		});

		// Joueur appuie sur "New game"
		socket.on('newGame', () => {
			if (roomManager.getRoomState(roomId) !== roomStates.RESULT) return;
			roomManager.onDisconnectEvent(socket.id, roomId);
			process.stdout.write(`${socket.id} quitte la room ${roomId} pour `);
			if (roomId !== null)
			{
				socket.leave(roomId);
				roomEmitter.off('stateChanged', onStateChanged);
			}
			[roomId, roomEmitter, playerEmitter] = roomManager.connectPlayer(socket.id);
			if (roomId !== null)
			{
				socket.join(roomId);
				roomEmitter.on('stateChanged', onStateChanged);
			}
			process.stdout.write(`rejouer dans une nouvelle room ${roomId}\n`);
			socket.emit('startLobby');
		});

		// Timer pour replay fini
		playerEmitter.on('timedOut', () => {
			if (roomId === null) return;
			socket.emit('timedOut');
			socket.leave(roomId);
			roomManager.onDisconnectEvent(socket.id, roomId);
			roomId = null;
		});

		/* ==========Deconnexion client==========*/
		// Joueur se deconnecte
		socket.on('disconnect', () => {
			roomManager.onDisconnectEvent(socket.id, roomId);
			roomEmitter.off('stateChanged', onStateChanged);
			console.log(`Joueur déconnecté : ${socket.id}`);
		});
	});
	const CommandLineInterpreter = new CLI(roomManager);
    CommandLineInterpreter.run();
}