import { Room} from "./Room.js";
import { Player } from "./Player.js";
import { EventEmitter } from "node:events";
import type { RoomManagerInterface, RoomId, gameMode, SafeUser } from "../utils/index.js";

export	class RoomManager implements RoomManagerInterface
{
	private _rooms : Room[];
	private _roomCount : number;

	private _createRoom(gameMode : gameMode) : Room {
		let room = new Room(this._roomCount, gameMode);
		this._roomCount++;
		this._rooms.push(room);
		room.start();
		return room
	}

	public connectPlayer(user : SafeUser, gamemode : gameMode) : 
	[roomId : RoomId, room : EventEmitter, player : EventEmitter, ingame : boolean]
	{
		let player : Player | undefined;
		let room : Room | undefined;
		let ingame = true;

		room = this._rooms.find(room => room.accessPlayerByUserId(user.id));
		player = room?.accessPlayerByUserId(user.id);
		if (room === undefined)
		{
			room = this._accessFreeRoom(gamemode);
			player = new Player(user);
			ingame = false;
		}
		room.onJoin(player as Player, ingame);
		console.log(room);
		return ([room.getId(), room as EventEmitter, player as EventEmitter, ingame]);
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

	private _accessFreeRoom(gamemode : gameMode) : Room {
		let room : Room | undefined = this._rooms.find(room => room.getIsAccessible() && room.getGameMode() === gamemode);
		if (room === undefined)
			room = this._createRoom(gamemode);
		return room;
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