import { handleOAuthLogin } from "../services/oauthService.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Profile42, ProfileGoogle } from "../types/interfaces.js";
import {prisma} from "../../prisma/prisma.js"

export async function intraHandler(req: FastifyRequest, reply: FastifyReply) {

	const fastify = req.server;
	const { token } = await fastify.intra42.getAccessTokenFromAuthorizationCodeFlow(req);

  const response = await fetch("https://api.intra.42.fr/v2/me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  let profile : Profile42;
  profile = await response.json() as Profile42;
  if (!response.ok)
    return reply.code(401).send({ error: "Failed to fetch profile from 42 Intra" });

  const result = await handleOAuthLogin(fastify, "intra42", {
    providerId: profile.id.toString(),
    email: profile.email,
    username: profile.login,
  });
  const userInDb = await prisma.user.findUnique({ where: { id: result.user.id } });

  const is2faRequired = userInDb?.twoFactorEnabled ?? false;

  const appToken = fastify.jwt.sign({
    userId: result.user.id,
    username: result.user.username,
    twoFactorVerified: !is2faRequired
  }, { expiresIn: '1h' });

  reply.setCookie("token", appToken, {
    path: "/",
    httpOnly: false, // TODO : TRUE EN PROD
    secure: false,
    sameSite: "strict",
    maxAge: 86400,
  });
  // TODO : REDIRECT TO RIGHT URL
  return (reply.redirect("http://localhost:5173"));
}

export async function googleHandler(req: FastifyRequest, reply: FastifyReply) {

	const fastify = req.server;
	const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);

  const response : Response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  
  let profile : ProfileGoogle;
  profile = await response.json() as ProfileGoogle;

  if (!response.ok)
    return reply.code(401).send({ error: "Failed to fetch profile from 42 Intra" });

  const result = await handleOAuthLogin(fastify, "google", {
    providerId: profile.id.toString(),
    email: profile.email,
    username: profile.name,
  });
  const userInDb = await prisma.user.findUnique({ where: { id: result.user.id } });

  const is2faRequired = userInDb?.twoFactorEnabled ?? false;
  
  const appToken = fastify.jwt.sign({
    userId: result.user.id,
    username: result.user.username,
    twoFactorVerified: !is2faRequired
  }, { expiresIn: '1h' });

  reply.setCookie("token", appToken, {
    path: "/",
    httpOnly: false, // TODO : TRUE EN PROD
    secure: false,
    sameSite: "strict",
    maxAge: 86400,
  });
  return (reply.redirect("http://localhost:5173"));
}