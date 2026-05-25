// import { Player } from './Player.js';
import { RoomManager } from './game/game_logic/RoomManager.js';
import { CLI } from './game/game_logic/CommandLine.js';

const roomManager = new RoomManager();
if (true)
{
	const CommandLineInterpreter = new CLI(roomManager);
	CommandLineInterpreter.run();
}