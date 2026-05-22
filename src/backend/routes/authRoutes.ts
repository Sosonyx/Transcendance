import type { FastifyInstance } from "fastify" 
import { registerController, loginController, logoutController } from "../controllers/authController.js";
import { getLeaderbordController, getProfileController, getOtherProfileController } from "../controllers/profileController.js";
import { requireAuth } from "../services/authService.js";
import { intraHandler, googleHandler } from '../controllers/oAuthController.js'

export async function publicRoutes(fastify: FastifyInstance){
	fastify.post('/api/register', registerController);
	fastify.post('/api/login', loginController);
	fastify.post('/api/logout', logoutController);
	fastify.post('/api/profile/:username', getOtherProfileController);
	fastify.get('/api/leaderboard', getLeaderbordController);
	fastify.get('/api/auth/42/callback', intraHandler)
	fastify.get('/api/auth/google/callback', googleHandler)
}

export async function privateRoutes(fastify: FastifyInstance){
  fastify.addHook('preHandler', requireAuth);
  fastify.get('/api/profile', getProfileController);
}
