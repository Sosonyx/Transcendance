import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma/prisma.js';

// Ajouter un ami
export async function addFriend(req: FastifyRequest, reply: FastifyReply) {
	const { username } = req.params as { username: string };
	const userId = (req.user as any).userId;

	const friend = await prisma.user.findUnique({ where: { username } });
	if (!friend) {
		return reply.status(404).send({ error: 'Utilisateur non existant' });
	}
	if (friend.id === userId) {
		return reply.status(400).send({ error: 'Vous ne pouvez pas etre ami avec vous meme' });
	}

	const isAlreadyFriend = await prisma.friendship.findUnique({
		where: {
			userId_friendId: {
				userId: userId,
				friendId: friend.id,
			},
		},
	});
	if (isAlreadyFriend) {
		return reply.status(400).send({ error: 'Deja ami avec cet utilisateur' });
	}

	await prisma.friendship.create({
		data: {
			userId: userId,
			friendId: friend.id,
		},
	});
	return reply.send({ success: true });
}

// Supprimer un ami
export async function removeFriend(req: FastifyRequest, reply: FastifyReply) {
	const { username } = req.params as { username: string };
	const userId = (req.user as any).userId;

	const friend = await prisma.user.findUnique({ where: { username } });
	if (!friend) {
		return reply.status(404).send({ error: 'Utilisateur non existant' });
	}

	await prisma.friendship.delete({
		where: {
			userId_friendId: {
				userId: userId,
				friendId: friend.id,
			},
		},
	});

	return reply.send({ success: true });
}

// Lister ses amis
export async function listFriends(req: FastifyRequest, reply: FastifyReply) {
	const userId = (req.user as any).userId;
	const onlineCheckStatusMs = 60_000;

	const friendships = await prisma.friendship.findMany({
		where: { userId },
		include: { friend: true },
	});

	const friends = friendships.map((f) => ({
		id: f.friend.id,
		username: f.friend.username,
		avatar: f.friend.avatar,
		online:
			!!f.friend.lastSeenAt &&
			Date.now() - new Date(f.friend.lastSeenAt).getTime() < onlineCheckStatusMs,
	}));

	return reply.send(friends);
}