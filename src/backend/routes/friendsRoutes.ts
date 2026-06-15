import type { FastifyInstance } from 'fastify';
import { addFriend, removeFriend, listFriends } from '../controllers/friendsController.js';
import { requireAuth } from '../services/authService.js';

export async function friendsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.post('/api/friend/:username', addFriend);
  app.delete('/api/friend/:username', removeFriend);
  app.get('/api/friends', listFriends);
}