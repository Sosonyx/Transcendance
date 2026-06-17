import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma/prisma.js';
import { requireAuth } from '../services/authService.js';

export async function messagesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.get('/api/messages/:friendId', async (req, _reply) => {
    const userId = (req.user as any).userId;
    const { friendId } = req.params as { friendId: string };
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    return messages;
  });
}