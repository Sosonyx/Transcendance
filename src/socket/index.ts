import { Server } from 'socket.io';
import { EventEmitter } from "node:events";
import { RoomManager } from '../game/RoomManager.js';
import { roomStates } from '../game/Room.js';
import { type Message } from '../types/index.js';

import { CLI } from '../game/CommandLine.js';

export function registerSocketHandlers(io: Server) {
	const roomManager = new RoomManager();

	/* ===============Connexion client================= */
	io.on('connection', (socket) => {
		console.log(`Joueur connecté : ${socket.id}`);

		// Recupere la room
		const [roomId, roomEmitter] : [string, EventEmitter] = roomManager.connectPlayer(socket.id);

		// Rejoins sa room
		socket.join(roomId);

		// Joueur pret
		socket.on('ready', () => {
			roomManager.onReadyEvent(socket.id, roomId);
		});

		// Changement d'etat de la room
		roomEmitter.on('stateChanged', (roomId:string, state: string) => {
		    switch (state) {
		        case roomStates.VOTE: {
		            io.to(roomId).emit('startVote', roomManager.getPlayersIdFromRoomId(roomId));
		            console.log(`${roomId}: starting vote`);
		            break;
		        }
		        case roomStates.ACTION: {
		            io.to(roomId).emit('startAction');
		            console.log(`${roomId}: starting action`);
		            break;
		        }
		        default: {
		            break;
		        }
		    }
		});

		// Joueur envoie un message
		socket.on('message', (content: string) => {
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

		// Joueur vote
		socket.on('vote', (playerId: string) => {
			roomManager.onVoteEvent(socket.id, playerId, roomId);
			console.log(`${socket.id} a vote pour ${playerId}`);
		});

		// Joueur se deconnecte
		socket.on('disconnect', () => {
			console.log(`Joueur déconnecté : ${socket.id}`);
		});
	});
	const CommandLineInterpreter = new CLI(roomManager);
    CommandLineInterpreter.run();
};