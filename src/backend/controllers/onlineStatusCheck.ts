import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/prisma.js";

/* heartbeat function is used to update the lastSeenAt of the user in the DB, to maintain online status */
export async function heartbeat(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as any).userId;
    
    await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
    
    return reply.send({ ok: true });
}