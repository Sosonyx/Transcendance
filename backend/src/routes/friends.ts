import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export async function friendRoutes(app: FastifyInstance)
{
	/* username is dynamic (:username) */
	/* request.params is the URL parameter */
	app.post("/api/friend/:username", async (request, reply) => {
		const {username} = request.params as {username: string}
		const me = request.body;
		const target = await prisma.user.findUnique({ where: { username } });
		
		return reply.send({ ok: !!target });
	});
}