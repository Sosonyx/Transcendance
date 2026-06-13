export interface Player {
    id: string;
    gameId: string;
    userId: string | null;
    name: string;
    status: string;
    score: number;
    won: boolean;
}

export interface User{
    id: string,
	email: string,
	username: string,
	password: string,
	avatar?: string
	playedAs: Player[];
}

export interface Props{
	user: User | null
}

export interface LeaderboardUser {
    id: string,
    username: string,
    avatar?: string,
    numberbOfGames: number,
    gameWin: number,
    gamesWon: number,
    winrate: number
}

export interface JwtPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

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

export interface Message {
    senderId: string,
    content: string,
    timestamp: number
}

export type VoteInfo = [userid: string | null, playerid: string, name: string, votes: number]

export type AnswersType = [playerName: string, answer: string][]

export enum GameMode {
	SCORE = "SCORE",
	ELIMINATION = "ELIMINATION"
}

export interface LobbyInfo {
	_mode : GameMode | null;
	_llmCount : number;
	_players : string[];
	_spots : number;
}

export interface ScoreInfo {
	_alive : [login : string, score : number | null][],
	_eliminated : [login : string][]
};