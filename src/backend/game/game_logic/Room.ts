import { Player } from "./Player.js";
import { LlmPlayer } from "./LlmPlayer.js";
import { v4 as uuid } from 'uuid';
import { EventEmitter } from "node:events";
import type { Message } from "../../llm/types/messages.js";
import { GameMode , RoomType, shuffle } from "../utils/index.js";
import { prisma } from "../../prisma/prisma.js"
import type { VoteInfo, LobbyInfo, ScoreInfo, RoundResultInfo, GameConfig, ResultInfo } from "../utils/index.js";
import { names } from "./Names.js"
import { colors } from "./Colors.js"

export enum roomStates {
	INIT = "INIT",
	LOBBY = "LOBBY",
	ACTION_1 = "ACTION_1",
	ACTION_2 = "ACTION_2",
	CHAT = "CHAT",
	VOTE = "VOTE",
	ROUND_RESULT = "ROUND_RESULT",
	RESULT = "RESULT",
	ERROR = "ERROR"
}

const action_1_Time : number = 30; // 30 seconds
const action_2_Time : number = 30; // 30 seconds
const chatTime : number = 60; // 60 seconds
const voteTime : number = 30; // 30 seconds
const roundResultTime : number = 10; // 10 seconds
const replayTime : number = 30; // 30 seconds
const maxPlayerCount : number = 8;
const scoreCorrectVote : number = 3;
const scoreGetVoted : number = 1;
const scoreObjective : number = 10;
const eliminationTreshold : number = 1;
const llmNumber : number = 1;

const minTime : number = 10;
const maxTime : number = 120;
const minPlayer : number = 2;
const maxPlayer : number = 100;
const minLlm : number = 0;
const maxLlm : number = 100;
const minScore : number = 1;
const maxScore : number = 100;
const minElim : number = 1;
const maxElim : number = 99;

type playerInput =  { name : string, input : string, color? : string | undefined};
type winCondition = () => boolean;
type computeVote = () => void;

export class Room extends EventEmitter
{
	private	readonly _id : string;
	private _roomType : RoomType;

	private _config : GameConfig;
	
	private	_gameId? : string | null;
	private _number : number;
	private _state : roomStates;
	private	_players : Player[];
	private _inputs : playerInput[];
	private _input : playerInput | null;
	private _playerCount : number;
	private _isAccessible : boolean;
	private _winCondition : winCondition | null;
	private _computeVote : computeVote | null;
	private _timerId : NodeJS.Timeout | undefined;
	private _data : any;
	private _timeInfo : number | null;
	private _winners : Player[];
	
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
						status : (player.getIsLLM() ? 'llm' : 'user')
					}))
				}
			},
			include : {players:true}
		});
	};

	private async _registerResult()
	{
		await Promise.all( this._players.map(p => 

				prisma.player.update({
					data :	{	
						won : p.getWon(),
						score : p.getScore() 
					},
					where : { id : p.getId() }
			}))
		)
	}

	// SETGET

	public getRoomType() : RoomType {
		return this._roomType;
	}

	public getGameMode() : GameMode {
		return this._config.gameMode;
	}

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
		return this._config.maxPlayerCount;
	}

	public getState() : string {
		return this._state;
	}

	public getConnectedPlayerCount() : number {
		return (this._players.filter(p => !p.getIsLLM() && p.getConnected()).length);
	}

	public getIsAccessible() : boolean {
		return this._isAccessible;
	}


	private _allPlayersShouldAct() {
		this._players.forEach((player : Player) => player.setActed(false));
	}

	// STATE LOGIC

	public sendSynchro(player : EventEmitter) : void
	{
		player.emit('synchronize', this._state, this._data, this._timeInfo, this._constructScoreInfo());
		if (this._state === roomStates.LOBBY)
			this.emit('lobby_info', this._constructLobbyInfo());
	}

	public stateSwitch(newState : roomStates) : void 
	{
		this._data = null;
		this._timeInfo = null;

		if (!(newState in roomStates))
			newState = roomStates.ERROR;
		clearTimeout(this._timerId);

		switch (newState) {

			case (roomStates.LOBBY) :
				this._pickGameMode();
				break ;

			case (roomStates.ACTION_1) :
				console.log(this);
				this._givePlayersName();
				this._givePlayersColor();
				this._players = shuffle(this._players);
				this._allPlayersShouldAct();
				this._timeInfo = Date.now() + action_1_Time * 1000;
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.ACTION_2) }, action_1_Time * 1000);
				break ;

			case (roomStates.ACTION_2) :
				this._allPlayersShouldAct();
				this._timeInfo = Date.now() + action_2_Time * 1000;
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.CHAT) }, action_2_Time * 1000);
				this._input = this._pickAnInput();
				if (this._input === null)
				{
					this.stateSwitch(roomStates.CHAT)
					return ;
				}
				this._data = this._input.input;
				break;
			case (roomStates.CHAT) :
				this._data = {
					question: this._input?.input,
					answers : this._inputs.map(p => [p.name, p.input, p.color])
				}
				this._players.forEach((player) => {
					if (player.getIsLLM())
						(player as LlmPlayer).getBrain()?.startPlaying();
				});
				this._timeInfo = Date.now() + this._config.chatTime * 1000;
				this._timerId = setTimeout(() => { this.stateSwitch(roomStates.VOTE) }, this._config.chatTime * 1000);
				break ;

			case (roomStates.VOTE) :
				this._players.forEach((player) => {
					if (player.getIsLLM())
						(player as LlmPlayer).getBrain()?.stopPlaying();
				});
				this._data = this._constructVoteInfo();
				this._allPlayersShouldAct();
				this._timeInfo = Date.now() + this._config.voteTime * 1000;
				this._timerId = setTimeout(() => { this._computeVotesAndNewState() }, this._config.voteTime * 1000);
				break ;

			case (roomStates.ROUND_RESULT) :
				this._timeInfo = Date.now() + roundResultTime * 1000;
				this.emit('score_info', this._constructScoreInfo());
				this._data = this._constructRoundResultInfo();
				this._timerId = setTimeout(() => { this._checkRoundResultStatus() }, roundResultTime * 1000);
				break ;

			case (roomStates.RESULT) :
				this._registerResult();
				this._timeInfo = Date.now() + replayTime * 1000;
				this._data = this._constructResultInfo();
				this._timerId = setTimeout(() => { this._onReplayTimerEnded() }, replayTime * 1000);
				break ;

			default : break ;
		}
		console.log(`\x1b[33m-> Room ${this._number} : switching from ${this._state} to ${newState}\x1b[0m`)
		this._state = newState;
		this.emit('stateChanged', this._state, this._data, this._timeInfo)
	}

	public start() {
		this.stateSwitch(roomStates.LOBBY);
	}

	// EVENTS

	public registerConfig(config : GameConfig) : boolean {
		if (this._state !== roomStates.LOBBY)
			return (false);
		if (config.maxPlayerCount < this._playerCount || config.maxPlayerCount < minPlayer || config.maxPlayerCount > maxPlayer)
			return (false);
		if (config.chatTime < minTime || config.chatTime > maxTime)
			return (false);
		if (config.voteTime < minTime || config.voteTime > maxTime)
			return (false);
		if (config.llmNumber < minLlm || config.llmNumber > maxLlm)
			return (false);
		if (config.gameMode === GameMode.SCORE) {
			if (config.scoreObjective < minScore || config.scoreObjective > maxScore)
				return (false);
		}
		if (config.gameMode === GameMode.ELIMINATION) {
			if (config.eliminationTreshold < minElim || config.eliminationTreshold > maxElim || config.eliminationTreshold > config.maxPlayerCount)
				return (false);
		}

		console.log('\n\n\n CONFIG VALIDEEE \n\n\n ');
		this._config = config;
		this._checkLobbyStatus();
		return (true);
	}

	public async onJoin(player : Player, ingame : boolean) {
		player.setConnected(true);
		if (this._state != roomStates.LOBBY || ingame)
			return ;
		if (this._roomType === RoomType.CUSTOM && this._playerCount === 0)
			player.setCustomizer(true);
		this._players.push(player);
		this._checkLobbyStatus();
	}

	public onReady(player : Player) {
		if (this._state != roomStates.LOBBY)
		{
			// this.stateSwitch(roomStates.ERROR);
			return ;
		}
		player.switchActed();
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
			let color : string = player.getColor();
			this._inputs.push({name, input, color});
			console.log(`Player ${player.getName()} (room ${this._number}) : ${input}`);
			player.setActed(true);
		}
		this._checkActionStatus();
	}

	public onChat(player : Player, message : string) {
		if (this._state != roomStates.CHAT && this._state != roomStates.VOTE)
		{
			this.stateSwitch(roomStates.ERROR);
			return ;
		}
		const msg: Message = { senderId: player.getName(), content: message, timestamp: Date.now() };
		this.emit("message", msg, player.getColor());
		this._players.forEach((player) => {
			if (player.getIsLLM())
				(player as LlmPlayer).getBrain()?.receiveUserMessage(msg);
		})
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
		if (playerFrom.getEliminated() || playerTo.getEliminated())
		{
			console.log(`Vote with eliminated player shouldn't be possible`);
			return ;
		}
		playerFrom.setVoteAgainst(playerTo);
		playerTo.gotVoted();
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
			case (roomStates.VOTE) :		newState = roomStates.ROUND_RESULT ; break ;
			default : 						newState = roomStates.ERROR ; break ;
		}
		this.stateSwitch(newState);
	}

	public onDisconnect(player : Player) : boolean {
		if (this._state != roomStates.LOBBY && this._state != roomStates.RESULT)
		{
			player.setConnected(false);
			return (this.getConnectedPlayerCount() === 0);
		}
		let index : number = this._players.findIndex(p => p.getId() === player.getId());
		if (index != -1)
			this._players.splice(index, 1);
		if (this.getConnectedPlayerCount() === 0)
			return (true);
		if (this._state === roomStates.LOBBY)
			this._checkLobbyStatus();
		if (this._state === roomStates.RESULT)
			this._checkResultStatus();
		return (false);
	}

	public destroy() {
		clearTimeout(this._timerId);
		this.removeAllListeners();
		
		const llms = this._players.filter(p => p.getIsLLM());
		(llms as LlmPlayer[]).forEach(p => p.getBrain()?.stopPlaying());
	}

	// ACCESS AND UTILS

	private	_checkRestart() {
		if (this._doAllPlayersWannaReplay())
		{
			this._restartRoom();
		}
	}

	private	_addLLMPLayer() {
		let LLMPlayer = new LlmPlayer();
		this._players.push(LLMPlayer);
	}

	private	_removeLLMPlayers() {
		this._players = this._players.filter(player => !player.getIsLLM());
	}

	private _restartRoom(full : boolean = true) {
		this._inputs = [];
		this._input = null;
		if (full)
			this._removeLLMPlayers();
		this._players.forEach(player => {player.reset(full)});
		if (full)
		{
			this._winners = [];
			this.stateSwitch(roomStates.LOBBY);
			this._checkLobbyStatus();
		}
	}

	private _onReplayTimerEnded()
	{
		clearTimeout(this._timerId);
		let timedOut = this._players.filter(player => !player.getIsLLM() && !player.getWantReplay());
		timedOut.forEach(player => {
			player.emit('timedOut')
		});
	}

	private _checkLobbyStatus()
	{
		if (this._state != roomStates.LOBBY)
		{
			return ;
		}
		this._playerCount = this._players.length;
		this._isAccessible = (this._playerCount !== this._config.maxPlayerCount);
		if (this._isLobbyReady())
		{
			this._isAccessible = false;
			for (let i = 0; i < this._config.llmNumber; i++)
				this._addLLMPLayer();

			//TODO : retirer nom du LLM dans chaque PlayerNames
			let playerNames = this._players.map(p => p.getName());
			const llms = this._players.filter(p => p.getIsLLM());
			(llms as LlmPlayer[]).forEach(llm => {
				llm._init(this as EventEmitter, playerNames)
			});
			this._createGameInDB();
			this.emit('score_info', this._constructScoreInfo());
			this.stateSwitch(roomStates.ACTION_1);
		}
		else
		{
			this.emit('lobby_info', this._constructLobbyInfo());
		}
	}

	private _checkVoteStatus()
	{
		console.log(this._checkVoteStatus);
		if (this._state != roomStates.VOTE)
		{
			return ;
		}
		if (!this._haveAllPlayersActed())
		{
			this.emit('vote_info', this._constructVoteInfo());
			return ;
		}
		this._computeVote!();
		this.stateSwitch(roomStates.ROUND_RESULT);
	}

	private _checkRoundResultStatus()
	{
		if (this._winCondition!())
		{
			console.log('GAME IS OVER !!!')
			console.log(this._winners);
			this._players = this._players.filter(p => p.getConnected());
			this.stateSwitch(roomStates.RESULT);
		}
		else
		{
			console.log('GAME CONTINUE !!!')
			this.stateSwitch(roomStates.ACTION_1);
			this._restartRoom(false);
		}
	}

	private async _checkActionStatus()
	{
		if (!this._haveAllPlayersActed())
		{
			console.log('Not all players have acted');
			return ;
		}
		clearTimeout(this._timerId);
		switch (this._state) {
			case roomStates.ACTION_1 :
			{
				const llms = this._players.filter(player => player.getIsLLM());
				let inputs = this._inputs.map(p => ({senderId: p.name, content: p.input, timestamp: Date.now()}));

				await Promise.all(
  					(llms as LlmPlayer[]).map(async (llm) => {
    					const llmInput = await llm.getBrain()?.askGlobalQuestion(inputs);
    					if (llmInput)
      						this._inputs.push(llmInput);
					}));
				
				this._inputs = shuffle(this._inputs);
				this.stateSwitch(roomStates.ACTION_2) ;
				return ;
			}
			case roomStates.ACTION_2 :
			{

				const llms = this._players.filter(player => player.getIsLLM());
				let inputs = this._inputs.map(p => ({senderId: p.name, content: p.input, timestamp: Date.now()}));

				await Promise.all(
					(llms as LlmPlayer[]).map(async (llm) => {
						const llmInput = await llm.getBrain()?.answerGlobalQuestion(this._input?.input ?? "", inputs);
						if (llmInput)
							this._inputs.push(llmInput);
					})	
				)

				this._inputs = shuffle(this._inputs);
				this.stateSwitch(roomStates.CHAT) ;
				return ;
			}
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
		let namePool = [...names];
		shuffle(namePool);
		this._players.forEach( player => {player.setName(namePool.pop() as string)} );
	}

	private _givePlayersColor() {
		let colorPool = [...colors];
		shuffle(colorPool);
		this._players.forEach( player => {player.setColor(colorPool.pop() as string)});
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
		console.log("Input picked for global question:", input);
		if (input === undefined)
			return null;
		return input;
	};

	private _constructRoundResultInfo() : RoundResultInfo {

		let info : RoundResultInfo = {
			_players : []
		};

		if (this._config.gameMode === GameMode.SCORE)
		{
			this._players.forEach(p => {
				info._players.push([p.getUsername() || 'IA', p.getName(), p.getIsLLM()]);
			})
		}
		else if (this._config.gameMode === GameMode.ELIMINATION)
		{
			let pool = this._players.filter(p => p.justGotEliminated());
			pool.forEach(p => {
				info._players.push([p.getUsername() || 'IA', p.getName(), p.getIsLLM()]);
			})
		}

		return (info);
	}

	private _constructScoreInfo() : ScoreInfo {
		
		let info : ScoreInfo = {
			_alive : [],
			_eliminated : []
		};

		if (this._config.gameMode === GameMode.SCORE)
		{
			let pool = this._players.filter(p => !p.getIsLLM());
			pool.forEach(p => {
				info._alive.push([p.getUsername()!, p.getScore()])});

			info._alive.sort((a: [string, score : number | null], b: [string, score : number | null]) => {
				if (a[1] === null || b[1] === null)
					return (0);
				return (b[1] - a[1]);
			});
		}
		else if (this._config.gameMode === GameMode.ELIMINATION)
		{
			this._players.forEach(p => {
				if (p.getEliminated())
					info._eliminated.push([p.getUsername() ?? 'IA']);
				else 
					info._alive.push([p.getUsername() ?? 'IA', null]);
			})
		}

		return info;
	}

	private _constructLobbyInfo() : LobbyInfo {

		let info : LobbyInfo = {
			_mode : this._config.gameMode,
			_llmCount : this._config.llmNumber,
			_players : [],
			_spots : this._config.maxPlayerCount - this._playerCount
		};

		this._players.forEach(p => info._players.push([p.getUsername()!, p.hasActed()]));

		return (info);
	}

	private _constructVoteInfo() : VoteInfo[] {

		let info : VoteInfo[] = [];

		const votable = this._players.filter(p => !p.getEliminated());
		votable.forEach(p => info.push([p.getUserId(), p.getId(), p.getName(), p.getVoted(), p.getColor()]));

		return (info);
	}

	private _constructResultInfo() : ResultInfo {

		let info : ResultInfo = {
			_players : []
		};

		this._winners.forEach(p => info._players.push([p.getUsername() ?? 'IA', p.getIsLLM()]));

		return (info);
	}

	// GAMEMODE

	private _pickGameMode() : void
	{
		switch (this._config.gameMode)
		{
			case (GameMode.SCORE) :
				this._computeVote = this.__computeVoteScore;
				this._winCondition = this.__winConditionScore;
				break ;
			case (GameMode.ELIMINATION) :
				this._computeVote = this.__computeVoteElimination;
				this._winCondition = this.__winConditionElimination;
				break ;
			default :
				console.log(`If you see this it's a bug`);
		}
	}

	private _computeVotesAndNewState() : void
	{
		this._computeVote!();
		this.stateSwitch(roomStates.ROUND_RESULT);
	}

	private __computeVoteScore() : void
	{
		if (this._config.gameMode === GameMode.SCORE)
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

	private __computeVoteElimination() : void
	{
		if (this._config.gameMode === GameMode.ELIMINATION)
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
			this._players.forEach(p => )
		}
	}

	private __winConditionScore() : boolean {
		if (this._players.filter(player => player.getScore() >= this._config.scoreObjective).length > 0)
		{
			let winners : Player[] = [];
			let maxScore = 0;

			this._players.forEach(p => {
				if (p.getScore() > maxScore)
					maxScore = p.getScore();
			});
			this._players.forEach(p => {
				if (p.getScore() === maxScore)
				{
					p.setWon(true);
					winners.push(p);
				}
			})

			this._winners = winners;
			return (true);
		}
		return (false);
	}

	private __winConditionElimination() : boolean {
		let winners : Player[] = [];
		let humans : Player[] = this._players.filter(
			player => !player.getIsLLM() && !player.getEliminated());
		
		if (humans.length <= this._config.eliminationTreshold)
		{
			this._players.forEach( p => {
				if (p.getIsLLM())
				{
					p.setWon(true);
					winners.push(p);
				}
			});
			this._winners = winners;
			return (true);
		}
		if (!this._players.find(player => player.getIsLLM() && !player.getEliminated()))
		{
			this._players.forEach ( p => {
				if (!p.getIsLLM() && !p.getEliminated())
				{
					p.setWon(true);
					winners.push(p);
				}
			})
			this._winners = winners;
			return (true);
		}
		if (!this._players.find(player => player.getEliminated()))
			return (true)
		return (false);
	}

	// CONSTRUCTOR

	public constructor(nb : number, gameMode : GameMode, roomType : RoomType)
	{
		console.log("Constructor called for class Room");
		super();

		this._id = uuid();
		this._roomType = roomType;

		this._config = {
			gameMode : gameMode,
			chatTime : chatTime,
			voteTime : voteTime,
			maxPlayerCount : maxPlayerCount,
			scoreObjective : scoreObjective,
			eliminationTreshold : eliminationTreshold,
			llmNumber : llmNumber
		}

		this._gameId = null;
		this._number = nb;
		this._state = roomStates.INIT;
		this._players = [];
		this._playerCount = 0;
		this._inputs = [];
		this._input = null;
		this._isAccessible = true;
		this._computeVote = null;
		this._winCondition = null;
		this._timeInfo = null;
		this._data = null;
		this._winners = [];

		this._pickGameMode();
		this._createRoomInDB();
	}
}
