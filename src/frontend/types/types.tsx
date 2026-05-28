export interface User{
	email: string,
	username: string,
	password: string
}

export interface Props{
	user: User | null
}