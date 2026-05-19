// import { Player } from './Player.js';
import { RoomManager } from './RoomManager.js';
import { CLI } from './CommandLine.js';

const roomManager = new RoomManager();
if (true)
{
	const CommandLineInterpreter = new CLI(roomManager);
	CommandLineInterpreter.run();
}