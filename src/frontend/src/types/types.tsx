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
