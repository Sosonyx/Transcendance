import { handleOAuthLogin } from "../services/oauthService.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function intraHandler(req: FastifyRequest, reply: FastifyReply){

  const fastify = req.server;
  const { token } = await fastify.intra42.getAccessTokenFromAuthorizationCodeFlow(req);

  const response = await fetch("https://api.intra.42.fr/v2/me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  const profile = await response.json();

  const result = await handleOAuthLogin(fastify, "42", {
    providerId: String(profile.id),
    email: profile.email,
    username: profile.login,
  });

  reply.setCookie("token", result.token, {
    path: "/",
    maxAge: 86400,
  });

  return (reply.redirect("http://localhost:3000"));
}

export async function googleHandler(req: FastifyRequest, reply: FastifyReply){

  const fastify = req.server;
  const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);

  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  
  const profile = await response.json();

  const result = await handleOAuthLogin(fastify, "google", {
    providerId: profile.id,
    email: profile.email,
    username: profile.name,
  });

  reply.setCookie("token", result.token, {
    path: "/",
    maxAge: 86400,
  });

  return (reply.redirect("http://localhost:3000"));
}