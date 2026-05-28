const API_BASE_URL = 'http://localhost:3000'

export async function logout(){
	const res = await fetch(`${API_BASE_URL}/api/logout`, {method: 'POST', credentials: 'include'})
	if (!res.ok)
		return (null)
	return (res)
}

export async function getProfile(){
	const res = await fetch(`${API_BASE_URL}/api/profile`, {method: 'GET', credentials: 'include'})
	if (!res.ok) 
		return null
	return res.json()
}

export async function register(email:string, username: string, password: string) {
	const res = await fetch(`${API_BASE_URL}/api/register`, {
		method: 'POST',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({email, username, password})
	})
	if (!res.ok) {
		throw new Error("Register error")
	}
	return res
}

export async function login(username: string, password: string) {
	const res = await fetch(`${API_BASE_URL}/api/login`, {
		method: 'POST',
		headers: {'Content-type': 'application/json'},
		credentials: 'include',
		body: JSON.stringify({username, password})
	})
	if (!res.ok) {
		throw new Error("Login error")
	}
	return (res)
}
