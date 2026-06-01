import type { FastifyInstance } from 'fastify';
import { modifyUserProfile } from '../controllers/usersController.js';

// Private route, requires authentication
export async function modifyUserRoutes(app: FastifyInstance) {
    app.patch('/api/profile', modifyUserProfile);
}

