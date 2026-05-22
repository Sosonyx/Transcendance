// import { Player } from './Player.js';
import { RoomManager } from './game/RoomManager.js';
import { CLI } from './game/CommandLine.js';

const roomManager = new RoomManager();
if (true)
{
	const CommandLineInterpreter = new CLI(roomManager);
	CommandLineInterpreter.run();
}