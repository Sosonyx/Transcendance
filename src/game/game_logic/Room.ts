import { Player } from "./Player.js";
import { v4 as uuid } from 'uuid';
import { EventEmitter } from "node:events";
import { Llm } from "../../llm/llm.js";
import type { Message } from "../../llm/types/messages.js";
import { shuffle } from "../utils/index.js";
import { prisma } from "../../prisma/prisma.js" 
import type { VoteInfo } from "../utils/index.js";

export enum roomStates {
	INIT = "INIT",
	LOBBY = "LOBBY",
	ACTION_1 = "ACTION_1",
	ACTION_2 = "ACTION_2",
	CHAT = "CHAT",
	VOTE = "VOTE",
	RESULT = "RESULT",
	ERROR = "ERROR"
}

// type playerInput =  { name : string, input : string};

enum gameMode {
	SCORE = 0,
	ELIMINATION = 1
}

const action_1_Time : number = 30 * 1000; // 30 seconds
const action_2_Time : number = 30 * 1000; // 30 seconds
const chatTime : number = 60 * 1000; // 30 seconds
const voteTime : number = 30 * 1000; // 30 seconds
const replayTime : number = 30 * 1000; // 30 seconds
const maxPlayerCount : number = 7;
const scoreCorrectVote : number = 3;
const scoreGetVoted : number = 1;
const scoreObjective : number = 10;
const eliminationTreshold : number = 1;

const possibleGameModes : gameMode[] = [gameMode.SCORE, gameMode.ELIMINATION];
const possibleNames : string[] = ['YELLOW', 'RED', 'BLUE', 'ORANGE', 'GREEN', 'PINK', 'WHITE', 'BLACK'];

type playerInput =  { name : string, input : string};
type winCondition = () => boolean;
type computeResult = () => void;

export class Room extends EventEmitter
{
	private	readonly _id : string;
	private	_gamemode : gameMode | null;
	private	_gameId? : string | null;
	private _number : number;
	private _state : roomStates;
	private	_players : Player[];
	private _inputs : playerInput[];
	private _input : playerInput | null;
	private _playerCount : number;
	private _maxPlayerCount : number;
	private _isAccessible : boolean;
	private _timerId : NodeJS.Timeout | undefined;
	private _llm: Llm | null;
	private _winCondition : winCondition | null;
	private _computeResult : computeResult | null;

	// DATABASE

	private	async _createRoomInDB() {
		console.log('saving room in DB');
		await prisma.room.create({
			data: {
				id : this._id
			}
		});
	};

	private	async _createGameInDB() {
		this._gameId = uuid();
		console.log('saving game in DB');
		await prisma.game.create({
			data: {
				id : this._gameId,
				roomId : this._id,
				startTime : new Date(),

				players : {
					create: this._players.map((player) => ({
						id : player.getId(),
						userId : player.getUserId(),
						name : player.getName(),
						status : (player.getIsLLM() ? 'llm' : 'user')
					}))
				}
			},
			include : {players:true}
		});
	};

	// SETGET

	public getId() : string {
		return this._id;
	}

	public getNumber() : number {
		return this._number;
	}

	public getPlayers() : Player[] {
		return this._players;
	}

	public getPlayerCount() : number {
		return this._playerCount;
	}

	public getMaxPlayerCount() : number {
		return this._maxPlayerCount;
	}

	public getState() : string {
		return this._state;
	}

	public getIsAccessible() : boolean {
		return this._isAccessible;
	}

	public getVotePoolFromPlayer(playerId : string) : VoteInfo[] {
		let votes : VoteInfo[] = [];
		let player : Player = this._players.find(player => player.getId() === playerId)!;

		if (player.getEliminated())
			return votes;

		let votable = this._players.filter(player => player.getId() !== playerId && player.getEliminated() === false);
		votable.forEach(player => votes.push([player.getId(), player.getName()]));

		return votes;
	}

	private _allPlayersShouldAct() {
		this._players.forEach((player : Player) => player.setActed(false));
	}

	// STATE LOGIC

	public stateSwitch(newState : roomStates) : void 
	{
		let data : any | null = null;

		if (!(newState in roomStates))
			newState = roomStates.ERROR;
		clearTimeout(this._timerId);

		switch (newState) {

			case (roomStates.LOBBY) : 
				break ;

			case (roomStates.ACTION_1) :
				this._givePlayersName();
				this._players = shuffle(this._players);
				this._allPlayersShouldAct();
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.ACTION_2) }, action_1_Time);
				break ;

			case (roomStates.ACTION_2) :
				this._allPlayersShouldAct();
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.CHAT) }, action_2_Time);
				this._input = this._pickAnInput();
				if (this._input === null)
					{
						this.stateSwitch(roomStates.CHAT)
						return ;
					}
				data = this._input.input;
				break;
			case (roomStates.CHAT) :
				data = {
					question: this._input?.input,
					answers : this._inputs.map(p => [p.name, p.input])
				}
				this._llm?.startPlaying();
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.VOTE) }, chatTime);
				break ;

			case (roomStates.VOTE) :
				this._llm?.stopPlaying();
				this._allPlayersShouldAct();
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.RESULT) }, voteTime);
				break ;

			case (roomStates.RESULT) :
				this._timerId = setTimeout(() => { this._onReplayTimerEnded() }, replayTime);
				break ;

			default : break ;
		}
		console.log(`\x1b[33m-> Room ${this._number} : switching from ${this._state} to ${newState}\x1b[0m`)
		this._state = newState;
		this.emit('stateChanged', this._state, data)
	}

	public start() {
		this.stateSwitch(roomStates.LOBBY);
	}

	// EVENTS

	public async onJoin(player : Player) {
		// TODO : TEMP 
		// FIX

		let image = await prisma.user.create({
			data : {
				id : player.getUserId() as string,
				email : uuid(),
				username : uuid()
			}
		}
		)
		console.log('temp : ', image.id)


		if (this._state != roomStates.LOBBY)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		this._players.push(player);
		this._checkLobbyStatus();
	}

	public onReady(player : Player) {
		if (this._state != roomStates.LOBBY)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		player.setActed(true);
		this._checkLobbyStatus();
	}

	public onInput(player : Player, input : string) {
		if (this._state != roomStates.ACTION_1 && this._state != roomStates.ACTION_2)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		if (player.hasActed())
			return ;
		if (this._state == roomStates.ACTION_1)
		{
			let name : string = player.getName();
			this._inputs.push({name, input});
			console.log(`Player ${player.getName()} (room ${this._number}) : ${input}`);
			player.setActed(true);
		}
		if (this._state == roomStates.ACTION_2)
		{
			let name : string = player.getName();
			this._inputs.push({name, input});
			console.log(`Player ${player.getName()} (room ${this._number}) : ${input}`);
			player.setActed(true);
		}
		this._checkActionStatus();
	}

	public onChat(player : Player, message : string) {
		if (this._state != roomStates.CHAT)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		const msg: Message = { senderId: player.getName(), content: message, timestamp: Date.now() };
		this.emit("message", msg);
		this._llm?.receiveUserMessage(msg);
		console.log(`Player ${player.getName()} (room ${this._number}) : ${message}`);
	}

	public onVote(playerFrom : Player, playerTo : Player) {
		if (this._state != roomStates.VOTE)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		if (playerFrom.hasActed())
		{
			console.log(`Player ${playerFrom.getName} has already voted.`);
			return ;
		}
		playerFrom.setVoteAgainst(playerTo);
		playerFrom.setActed(true);
		console.log(`Room ${this._number} : Player ${playerFrom.getName()} is voting against player ${playerTo.getName()}`);
		this._checkVoteStatus();
	}

	public onReplay(player : Player)
	{
		if (this._state != roomStates.RESULT)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		player.setWantReplay(true);
		this._checkRestart();
	}

	public onSkip()
	{
		let newState : roomStates;

		switch (this._state) {

			case (roomStates.ACTION_1) :	newState = roomStates.ACTION_2 ; break ;
			case (roomStates.ACTION_2) :	newState = roomStates.CHAT ; break ;
			case (roomStates.CHAT) :		newState = roomStates.VOTE ; break ;
			case (roomStates.VOTE) :		newState = roomStates.RESULT ; break ;
			default : 						newState = roomStates.ERROR ; break ;
		}
		this.stateSwitch(newState);
	}

	public onDisconnect(player : Player) {
		if (this._state != roomStates.LOBBY && this._state != roomStates.RESULT)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		let index : number = this._players.findIndex((elem) => elem.getId() === player.getId());
		this._players.splice(index, 1);
		if (this._state === roomStates.LOBBY)
			this._checkLobbyStatus();
		if (this._state === roomStates.RESULT)
			this._checkResultStatus();
	}

	// ACCESS AND UTILS

	private	_checkRestart() {
		if (this._doAllPlayersWannaReplay())
		{
			// TODO 
			this._restartRoom();
		}
	}

	private	_addLLMPLayer() {
		let LLMPlayer = new Player(null, true);
		this._llm = new Llm(this as EventEmitter, this._players.map(player => player.getName()));
		this._players.push(LLMPlayer);
	}

	private	_removeLLMPlayers() {
		this._players = this._players.filter(player => !player.getIsLLM());
		this._llm = null;
	}

	private _restartRoom(full : boolean = true) {
		this._inputs = [];
		this._input = null;
		if (full)
			this._removeLLMPlayers();
		this._players.forEach(player => {player.reset(full)});
		if (full)
		{
			this.stateSwitch(roomStates.LOBBY);
			this._checkLobbyStatus();
		}
		else
			this.stateSwitch(roomStates.ACTION_1)
	}

	private _onReplayTimerEnded()
	{
		clearTimeout(this._timerId);
		let timedOut = this._players.filter(player => !player.getIsLLM() && !player.getWantReplay());
		timedOut.forEach(player => {
			player.emit('timedOut')
		});
	}

	private _checkLobbyStatus() {
		if (this._state != roomStates.LOBBY)
		{
			this.stateSwitch(roomStates.ERROR);
				return ;
		}
		this._playerCount = this._players.length;
		this._isAccessible = (this._playerCount !== this._maxPlayerCount);
		if (this._isLobbyReady())
		{
			this._isAccessible = false;
			this._addLLMPLayer();
			this._createGameInDB();
			this.stateSwitch(roomStates.ACTION_1);
		}
	}

	private _checkVoteStatus() {
		console.log(this._checkVoteStatus)
		if (!this._haveAllPlayersActed())
			return ;
		this._computeResult!();
		if (this._winCondition!())
		{
			console.log('GAME IS OVER !!!')
			this.stateSwitch(roomStates.RESULT)
		}
		else
		{
			console.log('GAME CONTINUE !!!')
			this._restartRoom(false);
		}
	}

	private _checkActionStatus() {
		if (!this._haveAllPlayersActed())
		{
			console.log('Not all players have acted');
			return ;
		}
		switch (this._state) {
			case roomStates.ACTION_1 :
				this.stateSwitch(roomStates.ACTION_2) ;
				return ;
			case roomStates.ACTION_2 :
				this.stateSwitch(roomStates.CHAT) ;
				return ;
			default :
				this.stateSwitch(roomStates.ERROR);
		}
	}

	private _checkResultStatus() {
		if (this._state != roomStates.RESULT)
		{
			this.stateSwitch(roomStates.ERROR);
				return ;
		}
		if (this._playerCount === 0)
		{
			//TODO : delete
			console.log(`Room ${this._number} is empty, should be deleted`);
		}
		else
			this._checkRestart();
	}

	private _givePlayersName() {
		let namePool = [...possibleNames];
		shuffle(namePool);
		this._players.forEach( player => {player.setName(namePool.pop() as string)} );
	}

	public accessPlayerByName(name : string) : Player | undefined {
		return this._players.find(player => player.getName() == name);
	}

	public accessPlayerById(id : string) : Player | undefined {
		return this._players.find(player => player.getId() == id);
	}

	public accessPlayerByUserId(id : string) : Player | undefined {
		return this._players.find(player => player.getUserId() == id);
	}

	private _isLobbyReady() : boolean {
		return (this._playerCount > 1 && this._haveAllPlayersActed())
	}

	private _haveAllPlayersActed() : boolean {
		if (this._players.find(player  => !player.hasActed() && !player.getIsLLM() && !player.getEliminated()))
			return (false);
		return (true);
	}

	private _doAllPlayersWannaReplay() : boolean {
		if (this._players.find(player  => !player.getWantReplay() && !player.getIsLLM()))
			return (false);
		return (true);
	}

	private _pickAnInput() : playerInput | null {
		let input = this._inputs[Math.floor(Math.random() * this._inputs.length)];
		this._inputs = [];
		console.log(`Chosen input is : ${input}`);
		if (input === undefined)
			return null;
		// this._llm?.setGlobalQuestion(input);
		return input;
	}

	// GAMEMODE

	private _pickGameMode() : void
	{
		this._gamemode = possibleGameModes[Math.round(Math.random())]!;

		switch (this._gamemode)
		{
			case (gameMode.SCORE) :
				this._computeResult = this.__computeResultScore;
				this._winCondition = this.__winConditionScore;
				break ;
			case (gameMode.ELIMINATION) :
				this._computeResult = this.__computeResultElimination;
				this._winCondition = this.__winConditionElimination;
				break ;
			default :
				console.log(`If you see this it's a bug`);
		}
	}

	private __computeResultScore() : void
	{
		if (this._gamemode === gameMode.SCORE)
		{
			this._players.forEach(player => {
				if (!player.getIsLLM() && player.getVoteAgainst() !== null)
				{
					let target : Player = player.getVoteAgainst()!;
					if (target.getIsLLM())
						player.incrementScore(scoreCorrectVote);
					else 
						target.incrementScore(scoreGetVoted);
				}
			});
		}
	}

	private __computeResultElimination() : void
	{
		if (this._gamemode === gameMode.ELIMINATION)
		{
			this._players.forEach(player => {
				if (!player.getEliminated() && player.getVoteAgainst() != null)
				{
					let target : Player = player.getVoteAgainst()!;
					target.incrementScore(1);
				}}
			)
			const highScore = Math.max(...this._players.map(p => p.getScore()));
			const voted = this._players.filter(p => p.getScore() === highScore);

			voted.forEach(player => player.setEliminated(true));
		}
	}

	private __winConditionScore() : boolean {
		let winners : Player[] = this._players.filter(player => player.getScore() > scoreObjective);
		return (winners.length > 0)
	}

	private __winConditionElimination() : boolean {
		let humans : Player[] = this._players.filter(player => !player.getIsLLM() && !player.getEliminated());
		if (humans.length <= eliminationTreshold)
		{
			console.log('LLM won!');
			return (true);
		}
		if (!this._players.find(player => player.getIsLLM() && !player.getEliminated()))
		{
			console.log('Humans won!');
			return (true);
		}
		return (false);
	}

	// CONSTRUCTOR

	public constructor(nb : number) {
		super();
		console.log("Constructor called for class Room");
		this._id = uuid();
		this._gamemode = null;
		this._gameId = null;
		this._number = nb;
		this._state = roomStates.INIT;
		this._players = [];
		this._playerCount = 0;
		this._inputs = [];
		this._input = null;
		this._maxPlayerCount = maxPlayerCount;
		this._isAccessible = true;
		this._llm = null;
		this._computeResult = null;
		this._winCondition = null;

		this._pickGameMode();
		this._createRoomInDB();
	}
}