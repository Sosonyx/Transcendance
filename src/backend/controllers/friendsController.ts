import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

async function getAuthenticatedUsername(request: FastifyRequest, reply: FastifyReply) {
    try 
    {
        await request.jwtVerify({ onlyCookie: true });
    } catch {
        reply.code(401).send({ error: 'Unauthorized' });
        return null;
    }

    const me = request.user as { username?: string } | undefined;
    if (!me?.username) 
    {
        reply.code(401).send({ error: 'Unauthorized' });
        return null;
    }

    return me.username;
}

export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.params as { username: string };
    const myUsername = await getAuthenticatedUsername(request, reply);
    if (!myUsername) 
        return;

    if (myUsername === username) 
        return reply.code(400).send({ error: 'Cannot add yourself as a friend' });

    const [currentUser, targetUser] = await Promise.all([
        prisma.user.findUnique({ where: { username: myUsername } }),
        prisma.user.findUnique({ where: { username } }),
    ]);

    if (!currentUser || !targetUser) 
        return reply.code(404).send({ error: 'User not found' });

    const idA = currentUser.id;
    const idB = targetUser.id;
    // We order the IDs to ensure that the friendship is
    // always stored in the same way to prevent duplicates (A-B and B-A)
    const [uId, vId] = idA < idB ? [idA, idB] : [idB, idA];

    const friendshipAlreadyExist = await prisma.friendship.findFirst({
        where: { userId: uId, friendId: vId },
    });

    if (friendshipAlreadyExist) 
        return reply.send({ ok: true, message: 'Already friends' });

    await prisma.friendship.create({ data: { userId: uId, friendId: vId } });
    return reply.send({ ok: true, message: 'Friend added' });
}

export async function removeFriend(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.params as { username: string };
    const myUsername = await getAuthenticatedUsername(request, reply);
    if (!myUsername) 
        return;

    const [currentUser, targetUser] = await Promise.all([
        prisma.user.findUnique({ where: { username: myUsername } }),
        prisma.user.findUnique({ where: { username } }),
    ]);

    if (!currentUser || !targetUser) 
        return reply.code(404).send({ error: 'User not found' });

    const idA = currentUser.id;
    const idB = targetUser.id;
    const [uId, vId] = idA < idB ? [idA, idB] : [idB, idA];

    await prisma.friendship.deleteMany({ where: { userId: uId, friendId: vId } });

    return reply.send({ ok: true, message: 'Friend removed' });
}

export async function listFriends(request: FastifyRequest, reply: FastifyReply) {
    const myUsername = await getAuthenticatedUsername(request, reply);
    if (!myUsername) 
        return;

    const currentUser = await prisma.user.findUnique({ where: { username: myUsername } });

    if (!currentUser) 
        return reply.code(404).send({ error: 'User not found' });

    const friendships = await prisma.friendship.findMany({
        where: { OR: [{ userId: currentUser.id }, { friendId: currentUser.id }] },
        include: { user: true, friend: true },
    });

    const friendsMap = new Map<string, { id: string; email: string; username: string; avatar: string | null }>();

    for (const friendship of friendships) 
    {
        const friendUser = friendship.userId === currentUser.id ? friendship.friend : friendship.user;
        friendsMap.set(friendUser.id, {
            id: friendUser.id,
            email: friendUser.email,
            username: friendUser.username,
            avatar: friendUser.avatar,
        });
    }

    return reply.send({ ok: true, friends: [...friendsMap.values()] });
}

export default { addFriend, removeFriend, listFriends };
