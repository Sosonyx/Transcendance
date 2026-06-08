import { handleOAuthLogin } from "../services/oauthService.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Profile42, ProfileGoogle } from "../types/interfaces.js";

export async function intraHandler(req: FastifyRequest, reply: FastifyReply) {

	const fastify = req.server;
	const { token } = await fastify.intra42.getAccessTokenFromAuthorizationCodeFlow(req);

	const response = await fetch("https://api.intra.42.fr/v2/me", {
		headers: { Authorization: `Bearer ${token.access_token}` }
	});
	
	let profile: Profile42;
	profile = await response.json() as Profile42;
	if (!response.ok)
		throw new Error("42 user not found");

	const result = await handleOAuthLogin(fastify, "42", {
		providerId: profile.id.toString(),
		email: profile.email,
		username: profile.login,
	});

	reply.setCookie("token", result.token, {
		path: "/",
		maxAge: 86400,
	});
	return (reply.redirect("http://localhost:5173"));
}

export async function googleHandler(req: FastifyRequest, reply: FastifyReply) {

	const fastify = req.server;
	const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);

	const response: Response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: { Authorization: `Bearer ${token.access_token}` }
	});

	let profile: ProfileGoogle;
	profile = await response.json() as ProfileGoogle;

	if (!response.ok)
		throw new Error("Google user not found");

	const result = await handleOAuthLogin(fastify, "google", {
		providerId: profile.id,
		email: profile.email,
		username: profile.name,
	});

	reply.setCookie("token", result.token, {
		path: "/",
		maxAge: 86400,
	});

	return (reply.redirect("http://localhost:5173"));
}