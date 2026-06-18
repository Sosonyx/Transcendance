import { healthRoutes } from "./healthRoutes.js";
import type { FastifyInstance } from 'fastify';
import { publicRoutes, privateRoutes } from "./authRoutes.js";
import { oauthPlugin } from "../plugins/oauthPlugin.js";
import fastifyJwt from '@fastify/jwt';
// import fastifyCookie from '@fastify/cookie';
import { friendsRoutes } from './friendsRoutes.js';
import { messagesRoutes } from './friendsChatRoutes.js';




export async function initRoutes(fastify: FastifyInstance)
{
	await fastify.register(oauthPlugin);
	await fastify.register(fastifyJwt, {secret: process.env.JWT_SECRET!, cookie: { cookieName: 'token', signed: false }});
		
	await fastify.register(publicRoutes);
	await fastify.register(healthRoutes);
	await fastify.register(privateRoutes);
	await fastify.register(friendsRoutes);
  	await fastify.register(messagesRoutes);
	
}