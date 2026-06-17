import type { FastifyInstance } from "fastify"
import { registerController, loginController, logoutController } from "../controllers/authController.js";
import { getProfileController, getOtherProfileController, getLeaderbordController } from "../controllers/profileController.js";
import { modifyUserProfile } from "../controllers/usersController.js";
import { requireAuth } from "../services/authService.js";
import { intraHandler, googleHandler } from '../controllers/oAuthController.js'
import { setup2fa, verify2fa, validate2fa, disable2fa } from "../services/authService.js"; 

export async function publicRoutes(fastify: FastifyInstance) {
	fastify.post('/api/register', registerController);
	fastify.post('/api/login', loginController);
	fastify.post('/api/logout', logoutController);
	fastify.get('/api/profile/:username', getOtherProfileController);
	fastify.get('/api/leaderboard', getLeaderbordController)
	fastify.get('/api/auth/42/callback', intraHandler)
	fastify.get('/api/auth/google/callback', googleHandler)
}

export async function twoFactorRoutes(fastify: FastifyInstance){
  	fastify.addHook('preHandler', requireAuth);
	fastify.post("/api/2fa/setup", setup2fa);
	fastify.post("/api/2fa/verify", verify2fa);
	fastify.post("/api/2fa/validate", validate2fa);
	fastify.post("/api/2fa/disable", disable2fa);
}

export async function privateRoutes(fastify: FastifyInstance) {
	fastify.addHook('preHandler', requireAuth);
	fastify.patch('/api/profile', modifyUserProfile);
	fastify.get('/api/profile', getProfileController);
}