import { Room} from "./Room.js";
import { Player } from "./Player.js";
import { EventEmitter } from "node:events";
import { type RoomManagerInterface, type RoomId, type GameMode, type SafeUser, RoomType, CustomAction } from "../utils/index.js";

export	class RoomManager implements RoomManagerInterface
{
	private _rooms : Room[];
	private _roomCount : number;

	// --- ROOM ATTRIBUTION / PLAYER CONNECTION MANAGMENT ---------------------

	public connectPlayer(user : SafeUser, gameMode : GameMode, roomType : RoomType, customAction : CustomAction) : 
	[roomId : RoomId, room : EventEmitter, player : EventEmitter, ingame : boolean]
	{
		let player : Player | undefined;
		let room : Room | undefined;
		let ingame = true;

		console.log(`Connecting player fro room : ${gameMode} | ${roomType} | ${customAction}`);

		// Check if player already ingame
		room = this._rooms.find(room => room.accessPlayerByUserId(user.id));
		player = room?.accessPlayerByUserId(user.id);

		// Player is not ingame, creating / joining room
		if (room === undefined)
		{
			room = this._accessFreeRoom(gameMode, roomType, customAction);
			player = new Player(user);
			ingame = false;
		}

		room.onJoin(player!, ingame);
		console.log(room);
		return ([room.getId(), room as EventEmitter, player as EventEmitter, ingame]);
	}

	private _createRoom(gameMode : GameMode, roomType : RoomType) : Room
	{
		let room = new Room(this._roomCount, gameMode, roomType);
		this._roomCount++;
		this._rooms.push(room);
		room.start();
		return room
	}

	private _accessFreeRoom(gameMode : GameMode, roomType : RoomType, customAction : CustomAction) : Room
	{
		// Check if player wanna create a custom game
		if (roomType === RoomType.CUSTOM && customAction === CustomAction.CREATE)
		{
			return (this._createRoom(gameMode, roomType))
		}

		// Try to find a corresponding room...
		let room : Room | undefined = this._rooms.find(
			room => room.getIsAccessible() && room.getGameMode() === gameMode && room.getRoomType() === roomType);

		// ... or create a new one
		if (room === undefined)
			room = this._createRoom(gameMode, roomType);
		return room;
	}

	public askSynchronize(roomId : string, userId : string)
	{
		let player : Player | undefined;
		let room : Room | undefined;

		room = this._rooms.find(r => r.getId() === roomId);
		player = room?.accessPlayerByUserId(userId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${userId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.sendSynchro(player as EventEmitter);
	}

	// ------------------------------------------------------------------------

	public onReadyEvent(userId : string, roomId : RoomId)
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let player : Player | undefined;
		
		room = this._accessRoomById(roomId);
		player = room?.accessPlayerByUserId(userId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${userId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onReady(player);
		console.log(room);
	}

	public onInputEvent(userId : string, roomId : RoomId, message : string)
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let player : Player | undefined;

		room = this._accessRoomById(roomId);
		player = room?.accessPlayerByUserId(userId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${userId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onInput(player, message);
	}

	public onChatEvent(userId : string, roomId : RoomId, message : string)
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let player : Player | undefined;

		room = this._accessRoomById(roomId);
		player = room?.accessPlayerByUserId(userId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${userId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onChat(player, message);
	}

	public onVoteEvent(userIdFrom : string, playerIdTo : string, roomId : RoomId)
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let playerFrom : Player | undefined;
		let playerTo : Player | undefined;

		room = this._accessRoomById(roomId);
		playerFrom = room?.accessPlayerByUserId(userIdFrom);
		playerTo = room?.accessPlayerById(playerIdTo);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (playerFrom === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${userIdFrom} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		if (playerTo === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${playerIdTo} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onVote(playerFrom, playerTo);
		console.log(room);
	}

	public onDisconnectEvent( playerId : string, roomId : RoomId) : void
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let player : Player | undefined;

		room = this._accessRoomById(roomId);
		player = room?.accessPlayerByUserId(playerId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${playerId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onDisconnect(player);
		console.log(room);
	}

	public onReplayEvent(playerId : string, roomId : RoomId) : void
	{
		if (roomId === null)
			return ;

		let room : Room | undefined;
		let player : Player | undefined;

		room = this._accessRoomById(roomId);
		player = room?.accessPlayerByUserId(playerId);
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (player === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${playerId} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onReplay(player);
	};

	public onSkipEvent(roomId: RoomId) {
		if (roomId === null)
			return ;

		let room : Room | undefined;

		room = this._accessRoomByNumber(parseInt(roomId));
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onSkip();
	}

	public 	getRoomState(roomId : RoomId) : string | null
	{
		if (roomId === null)
			return (null);
		let room : Room | undefined =this._accessRoomById(roomId);
		if (room === undefined)
			return (null);
		return (room.getState());
	}

	private _accessRoomById(id : string) : Room | undefined {
		return this._rooms.find(room => room.getId() == id);
	}

	private _accessRoomByNumber(nb : number) : Room | undefined {
		return this._rooms.find(room => room.getNumber() == nb);
	}

	public display(entity : string, id : string)
	{
		// display room
		if (entity === 'room')
		{
			let room : Room | undefined = this._rooms.find((room) => room.getNumber() === parseInt(id))
			if (room)
				console.log(room);
			else
				console.log(`Couldn't find a room ${id} to display`)
		}

		//display player
		if (entity === 'player')
		{
			let player : Player | undefined = undefined;
			this._rooms.forEach(room => {
				player = room.accessPlayerByName(id);
				if (player)
					console.log(player);
			});
			if (!player)
				console.log(`Couldn't find a player ${id} to display`)
		}
	}

	public constructor() {
		console.log("Constructor called for class RoomManager");
		this._rooms = [];
		this._roomCount = 0;
	}
}