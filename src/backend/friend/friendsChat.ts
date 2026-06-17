import { Server } from 'socket.io';
import type { PrismaClient } from '@prisma/client';
import type { SafeUser } from '../game/utils/index.js';

export function getFriendRoomName(user1: string, user2: string): string {
    const user_array = [user1, user2].sort();
    return `friend:${user_array[0]}:${user_array[1]}`;
}


export function registerFriendChat(io: Server, prisma: PrismaClient) {

    io.on('connection', (socket) => {
        const user: SafeUser = socket.handshake.auth.user;
        if (!user)
            return;
            
        socket.on('friend:join', (friendId: string) => {
            const room = getFriendRoomName(user.id, friendId);
            socket.join(room);
        });

        socket.on('friend:message', async (friendId: string, content: string) => {
            if (typeof content !== 'string')
                return;
            if (content.trim() === '')
                return;
            if (content.length > 140)
                return;

            const message = await prisma.message.create({
                data: {
                    content: content.trim(),
                    senderId: user.id,
                    receiverId: friendId,
                }
            });
            const room = getFriendRoomName(user.id, friendId);

            io.to(room).emit('friend:message', {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                senderId: user.id,
                senderName: user.username,
            });
        });
    });
}



