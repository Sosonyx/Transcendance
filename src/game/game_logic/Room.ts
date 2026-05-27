import { Player } from "./Player.js";
import {v4 as uuid} from 'uuid';
import { EventEmitter } from "node:events";

const voteTime : number = 30 * 1000; // 30 seconds
const actionTime : number = 30 * 1000; // 30 seconds
const replayTime : number = 10 * 1000; // 10 seconds
const maxPlayerCount : number = 3;
const scoreCorrectVote : number = 3;
const scoreGetVoted : number = 1;

export enum roomStates {
	INIT = "INIT",
	LOBBY = "LOBBY",
	ACTION = "ACTION",
	VOTE = "VOTE",
	RESULT = "RESULT",
	ERROR = "ERROR"
}

export class Room extends EventEmitter
{
	private	_id : string;
	private _number : number;
	private _state : roomStates;
	private	_players : Player[];
	private _playerCount : number;
	private _maxPlayerCount : number;
	private _isAccessible : boolean;
	private _timerId : NodeJS.Timeout | undefined;

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

	private _setPlayersAsVoters() {
		this._players.forEach((player : Player) => player.setShouldVote(true));
	}

	// STATE LOGIC

	public stateSwitch(newState : roomStates) : void {
		if (!(newState in roomStates))
			newState = roomStates.ERROR;
		clearTimeout(this._timerId);

		if (newState === roomStates.ACTION)
		{
			this._addLLMPLayer();
			this._timerId = setTimeout(() => { this.stateSwitch(roomStates.VOTE) }, actionTime);
		}
		else if (newState === roomStates.VOTE)
		{
			this._setPlayersAsVoters();
			this._timerId = setTimeout(() => { this.stateSwitch(roomStates.RESULT) }, voteTime);
		}
		else if (newState === roomStates.RESULT)
		{
			this._computeResult();
			this._timerId = setTimeout(() => { this._onReplayTimerEnded() }, replayTime)
		}
		
		console.log(`\x1b[33m-> Room ${this._number} : switching from ${this._state} to ${newState}\x1b[0m`)
		this._state = newState;
		this.emit('stateChanged', this._state)
	}

	public start() {
		this.stateSwitch(roomStates.LOBBY);
	}

	// EVENTS

	public onJoin(player : Player) {
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
		player.switchReady();
		this._checkLobbyStatus();
	}

	public onChat(player : Player, message : string) {
		if (this._state != roomStates.ACTION)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		// TODO : define logic
		console.log(`Player ${player.getName()} (room ${this._number}) : ${message}`);
	}

	public onVote(playerFrom : Player, playerTo : Player) {
		if (this._state != roomStates.VOTE)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		if (!playerFrom.shouldVote())
		{
			// console.log(`Player ${playerFrom.getName} has already voted.`);
			return ;
		}
		playerFrom.setVoteAgainst(playerTo);
		playerFrom.setShouldVote(false);
		console.log(`Room ${this._number} : Player ${playerFrom.getName()} is voting against player ${playerTo.getName()}`);
		if (this._haveAllPlayersVoted())
			this.stateSwitch(roomStates.RESULT)
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
		if (this._state != roomStates.ACTION && this._state != roomStates.VOTE)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		if (this._state === roomStates.ACTION)
		{
			this.stateSwitch(roomStates.VOTE);
			return ;
		}
		if (this._state === roomStates.VOTE)
		{
			this.stateSwitch(roomStates.RESULT);
			return ;
		}
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
		this._players.push(new Player(uuid(), true));
	}

	private	_removeLLMPlayers() {
		this._players = this._players.filter(player => !player.getIsLLM());
	}

	private _restartRoom() {
		this._removeLLMPlayers();
		this._players.forEach(player => {player.reset()});
		this.stateSwitch(roomStates.LOBBY)
		this._checkLobbyStatus();
	}

	private _computeResult() : void
	{
		this._players.forEach(player => {
			if (!player.getIsLLM() && player.getVoteAgainst() !== null)
			{
				let target : Player = player.getVoteAgainst() as Player;
				if (target.getIsLLM())
				{
					player.incrementScore(scoreCorrectVote);
				}
				else 
				{
					target.incrementScore(scoreGetVoted)
				}
			}
		});
	}

	private _onReplayTimerEnded()
	{
		clearTimeout(this._timerId);
		let timedOut = this._players.filter(player => !player.getIsLLM() && !player.getWantReplay());
		timedOut.forEach(player => {
			player.emit('timedOut')
		});
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
			this.stateSwitch(roomStates.ACTION);
		}
	}

	public accessPlayerByName(name : string) : Player | undefined {
		return this._players.find(player => player.getName() == name);
	}

	public accessPlayerById(id : string) : Player | undefined {
		return this._players.find(player => player.getId() == id);
	}

	private _isLobbyReady() : boolean {
		return (this._playerCount > 1 && this._areAllPlayersReady())
	}

	private _areAllPlayersReady() {
		if (this._players.find(player => player.isReady() === false))
			return (false);
		return (true);
	}

	private _haveAllPlayersVoted() : boolean {
		if (this._players.find(player  => player.shouldVote() && !player.getIsLLM()))
			return (false);
		return (true);
	}

	private _doAllPlayersWannaReplay() : boolean {
		if (this._players.find(player  => !player.getWantReplay() && !player.getIsLLM()))
			return (false);
		return (true);
	}

	// CONSTRUCTOR

	public constructor(nb : number) {
		super();
		console.log("Constructor called for class Room");
		this._id = uuid();
		this._number = nb;
		this._state = roomStates.INIT;
		this._players = [];
		this._playerCount = 0;
		this._maxPlayerCount = maxPlayerCount;
		this._isAccessible = true;
	}
}