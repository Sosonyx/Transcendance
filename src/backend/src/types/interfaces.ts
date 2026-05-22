export interface userInterface{
	id: string | null;
	email: string;
	username: string;
	password: string;
	avatar: string | null
};

export interface oAuthProfile{
	providerId: string,
	email: string,
	username: string
}
