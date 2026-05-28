import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

const userProfileSelect = {
    id: true,
    email: true,
    username: true,
    avatar: true,
};

export type UpdateProfileBody = { email?: string; avatar?: string };

export async function modifyUserProfile(request: FastifyRequest, reply: FastifyReply) 
{
    try 
    {
        await request.jwtVerify({ onlyCookie: true });
    } 
    catch 
    {
        return reply.code(401).send({ error: "Unauthorized" });
    }

    const me = request.user as { username?: string } | undefined;
    if (!me?.username) 
        return reply.code(401).send({ error: "Unauthorized" });

    const { email, avatar } = request.body as UpdateProfileBody;
    const data: { email?: string; avatar?: string } = {};
    if (email !== undefined) 
        data.email = email;
    if (avatar !== undefined) 
        data.avatar = avatar;
    const updatedUser = await prisma.user.update({ where: { username: me.username }, data, select: userProfileSelect });
    
    return reply.send({ user: updatedUser });
}
