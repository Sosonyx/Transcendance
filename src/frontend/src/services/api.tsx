import type { User, LeaderboardUser } from "../types/types.tsx"

export const API_BASE_URL = 'http://localhost:3000' //TMP METTRE URL SUR LEQUEL LE BACK ECOUTES

export async function logout(): Promise<Response> {
	const res = await fetch(`${API_BASE_URL}/api/logout`, {method: 'POST', credentials: 'include'})
	if (!res.ok)
		throw new Error("Logout error")
	return (res)
}

export async function getProfile(): Promise<User> {
	const res = await fetch(`${API_BASE_URL}/api/profile`, {method: 'GET', credentials: 'include'})
	if (!res.ok) 
		throw new Error("Profile error")
	return res.json()
}

export async function getLeaderbord(): Promise<LeaderboardUser[]> {
	const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
		method: 'GET',
		credentials: 'include'
	})
	if (!res.ok)
		throw new Error("User not found")
	const data: LeaderboardUser[] = await res.json();
	return data
}

export async function getOtherProfiles(username: string): Promise<User>{
	const res = await fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(username)}`, {
		method: 'GET',
		credentials: 'include'
	})
	if (!res.ok)
		throw new Error("User not found")
	return res.json()
}

export async function register(email:string, username: string, password: string): Promise<Response>{
	const res = await fetch(`${API_BASE_URL}/api/register`, {
		method: 'POST',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({email, username, password})
	})
	if (!res.ok) {
		throw new Error("Register error")
	}
	return (res)
}

export async function login(username: string, password: string): Promise<Response> {
	const res = await fetch(`${API_BASE_URL}/api/login`, {
		method: 'POST',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({username, password})
	})
	if (!res.ok)
		throw new Error("Login error")
	return (res)
}

export async function loginGoogle(): Promise<Response> {
	const res = await fetch(`${API_BASE_URL}/api/auth/google/callback`, {
		method: 'GET',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
	})
	if (!res.ok) {
		throw new Error("Login error")
	}
	return (res)
}

export async function login42(): Promise<Response> {
	const res = await fetch(`${API_BASE_URL}/api/auth/42/callback`, {
		method: 'GET',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
	})
	if (!res.ok) {
		throw new Error("Login error")
	}
	return (res)
}

export async function modifyUser(username: string, avatar: File | null) : Promise<User>{
	const formData = new FormData();
	formData.append('username', username);

	if (avatar) {
		formData.append('avatar', avatar);
	}

	const res = await fetch(`${API_BASE_URL}/api/profile`, {
		method: 'PATCH',
		credentials: 'include',
		body: formData
	})

	if (!res.ok)
		throw new Error("Profile update error")

	const data: { user: User } = await res.json();
	return data.user;
}
