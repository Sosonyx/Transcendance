import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../prisma/prisma.js';

const userProfileSelect = {
    id: true,
    email: true,
    username: true,
    avatar: true,
} as const;

async function findUserProfile(username: string) 
{
    return prisma.user.findUnique({ where: { username }, select: userProfileSelect });
}

export async function getPublicUserProfile(request: FastifyRequest, reply: FastifyReply) 
{
    const { username } = request.params as { username: string };

    const user = await findUserProfile(username);
    if (!user) 
        return reply.code(404).send({ error: "User not found" });
    return reply.send({ user });
}

export async function getCurrentUserProfile(request: FastifyRequest, reply: FastifyReply) 
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
    if (!me?.username) return reply.code(401).send({ error: "Unauthorized" });

    const user = await findUserProfile(me.username);
    if (!user) 
        return reply.code(404).send({ error: "User not found" });
    return reply.send({ user });
}

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

export default {
    getPublicUserProfile,
    getCurrentUserProfile,
    modifyUserProfile,
};
