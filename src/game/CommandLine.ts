import { RoomManager } from './RoomManager.js';
// import { Player } from './Player.js';
import readline from 'node:readline/promises';

export class CLI 
{
	private rl: readline.Interface;
	private roomManager: RoomManager;

	constructor(roomManager: RoomManager) {
		this.roomManager = roomManager;
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	private interpretLine(line: string): void {
		const [command, arg1, arg2, arg3] = line.split(' ');
		switch (command) {
			case 'display':
				if (arg1 && arg2 && !arg3)
					this.roomManager.display(arg1, arg2);
				else
					console.log("join ['room'/'player'] [id]");
				break;
			case 'connect':
				if (arg1 && !arg2 && !arg3)
					this.roomManager.connectPlayer(arg1, true);
				else
					console.log('connect [player name]');
				break;
			case 'disconnect':
				if (arg1 && arg2 && !arg3)
					this.roomManager.onDisconnectEvent(arg1, arg2, true);
				else
					console.log('disconnect [player name] [room id]');
				break;
			case 'ready':
				if (arg1 && arg2 && !arg3)
					this.roomManager.onReadyEvent(arg1, arg2, true);
				else
					console.log('ready [player name] [room id]');
				break;
			case 'chat':
				if (arg1 && arg2 && arg3)
					this.roomManager.onChatEvent(arg1, arg2, arg3, true)
				else
					console.log('chat [player] [room id] [message]');
				break;
			case 'vote':
				if (arg1 && arg2 && arg3)
					this.roomManager.onVoteEvent(arg1, arg2, arg3, true);
				else
					console.log('vote [player name] [player name] [room id]');
				break;
			case 'replay':
				if (arg1 && arg2 && !arg3)
					this.roomManager.onReplayEvent(arg1, arg2, true)
			default:
				console.log('Invalid command.');
		}
	}

	async run(): Promise<void> {
		while (true) {
			const line = await this.rl.question('\n> : ');
			if (line === 'exit') break;
				this.interpretLine(line);
		}
		this.rl.close();
	}
}