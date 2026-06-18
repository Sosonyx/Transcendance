export interface Player {
    id: string;
    gameId: string;
    userId: string | null;
    status: string;
    score: number;
    won: boolean;
}

export interface UserInterface {
    id: string;
    email: string;
	password?: string | null;
    username: string;
    avatar: string | null;
    playedAs?: Player[];
}

export interface UserSafeInterface {
    id?: string;
    email?: string;
    username: string;
    avatar: string | null;
    playedAs?: Player[];
}

export interface oAuthProfile {
    providerId: string;
    email: string;
    username: string;
}

export interface UserMap {
    id: string;
    username: string;
    avatar: string | null;
    numberOfGames: number;
    gamesWon: number;
    winrate: number;
}

export interface DBUserResponse {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    playedAs: Player[];
}

export interface JwtPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export interface ProfileGoogle {
    id: string;
    email: string;
    name: string 
}

export interface Profile42 {
    id: string;
    email: string;
    login: string 
}
