import { Room } from "./Room.js";
import { Player } from "./Player.js";
import { EventEmitter } from "node:events";

// emit('stateChanged', roomId : string, newState : roomState)

// When a new room is created, I need to give to Jesus side the room as an eventEmitter.
//
// 2 possibilities :
//	-> connectClient function, directly called by Jesus, returns [roomId, EventEmitter | null]
//	-> 

interface RoomManagerInterface {
	connectPlayer(playerId : string, isTTY? : boolean) : [string, EventEmitter]; // return RoomId + room as Emitter if new room
	onReadyEvent(playerId : string, roomId : string, isTTY? : boolean) : void;
	onChatEvent(playerId : string, roomId : string, message : string, isTTY? : boolean) : void;
	onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : string, isTTY? : boolean) : void;
	getPlayersIdFromRoomId(roomId : string) : readonly string[]; // return playersId
}

export	class RoomManager implements RoomManagerInterface
{
	private _rooms : Room[];
	private _roomCount : number;

	private _createRoom() : Room {
		let room = new Room(this._roomCount);
		(room as EventEmitter).on('stateChanged', (roomId, state) => { console.log(`room ${roomId} is now in state ${state}`) });
		this._roomCount++;
		this._rooms.push(room);
		room.start();
		return room
	}

	public connectPlayer(playerId : string , isTTY : boolean = false) : [string, EventEmitter] {
		let player : Player | undefined;
		let room : Room | undefined;

		//check if a player with this id is already logged in a room
		if (isTTY)
		{
			room = this._rooms.find(room => room.accessPlayerByName(playerId));
			player = room?.accessPlayerByName(playerId);
			if (room)
				console.log(`Found existing room ${room.getNumber()}`);
		}
		else
		{
			room = this._rooms.find(room => room.accessPlayerById(playerId));
			player = room?.accessPlayerById(playerId);
		}
		if (room === undefined)
		{
			room = this._accessFreeRoom();
			player = new Player(playerId);
		}
		room.onJoin(player as Player);
		// if (isTTY)
		// 	console.log(room);
		return ([room.getId(), room as EventEmitter]);
	}

	public onReadyEvent(playerId : string, roomId : string, isTTY : boolean = false) {
		let room : Room | undefined;
		let player : Player | undefined;
		if (isTTY)
		{
			room = this._accessRoomByNumber(parseInt(roomId));
			player = room?.accessPlayerByName(playerId);
		}
		else
		{
			room = this._accessRoomById(roomId);
			player = room?.accessPlayerById(playerId);
		}
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
		room.onReady(player);
		// if (isTTY)
		// console.log(room);
	}

	public onChatEvent(playerId : string, roomId : string, message : string, isTTY : boolean = false) {
		let room : Room | undefined;
		let player : Player | undefined;
		if (isTTY)
		{
			room = this._accessRoomByNumber(parseInt(roomId));
			player = room?.accessPlayerByName(playerId);
		}
		else
		{
			room = this._accessRoomById(roomId);
			player = room?.accessPlayerById(playerId);
		}
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
		// TODO: implement logic 
		room.onChat(player, message);
	}

	public onVoteEvent(playerIdFrom : string, playerIdTo : string, roomId : string, isTTY : boolean = false) {
		let room : Room | undefined;
		let playerFrom : Player | undefined;
		let playerTo : Player | undefined;
		if (isTTY)
		{
			room = this._accessRoomByNumber(parseInt(roomId));
			playerFrom = room?.accessPlayerByName(playerIdFrom);
			playerTo = room?.accessPlayerByName(playerIdTo);
		}
		else
		{
			room = this._accessRoomById(roomId);
			playerFrom = room?.accessPlayerById(playerIdFrom);
			playerTo = room?.accessPlayerById(playerIdTo);
		}
		if (room === undefined)
		{
			console.error(`\n\x1b[41mNo room found with ID ${roomId}\x1b[0m\n`);
			return ;
		}
		if (playerFrom === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${playerIdFrom} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		if (playerTo === undefined)
		{
			console.error(`\n\x1b[41mNo player with ID ${playerIdTo} in room ${roomId}\x1b[0m\n`);
			return ;
		}
		room.onVote(playerFrom, playerTo);
	}

	public getPlayersIdFromRoomId(roomId: string): readonly string[] {
		let res : string[] = [];
		let players : Player[] | undefined = this._accessRoomById(roomId)?.getPlayers();
		players?.forEach((player) => {res.push(player.getId())});
		return res;
	}

	private _accessFreeRoom() : Room {
		let room : Room | undefined = this._rooms.find(room => room.getIsAccessible());
		if (room === undefined)
			room = this._createRoom();
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