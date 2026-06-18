import type { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/multipart';
import { prisma } from '../prisma/prisma.js';
import type { JwtPayload } from '../types/interfaces.js';
import { isValidUsername } from './authController.js';

const userProfileSelect = {
    id: true,
    email: true,
    username: true,
    avatar: true,
    playedAs: true,
} as const;

export async function getUser(req: FastifyRequest, reply: FastifyReply){
    const jwtoken = req.cookies?.token;

    if (!jwtoken) {
    return (reply.code(401).send({ error: "Utilisateur non connecté." }));
    }

    const decoded = req.server.jwt.decode<JwtPayload>(jwtoken);
    if (!decoded) {
    return (reply.code(401).send({ error: "Token invalide." }));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    return (user)
}

export type UpdateProfileBody = { username?: string; avatar?: string };

export async function modifyUserProfile(request: FastifyRequest, reply: FastifyReply) 
{
    const fastify = request.server;
    try 
    {
        await request.jwtVerify({ onlyCookie: true });
    } 
    catch (jwtError)
    {
        return (reply.code(401).send({ error: "Non autorisé." }));
    }

    const me = await getUser(request, reply);
    if (!me) 
        return reply.code(401).send({ error: "Non autorisé." });
    const parts = request.parts()
    const data: { username?: string; avatar?: string } = {};
    try {
        for await (const part of parts) {
            if (part.type === 'file' && part.fieldname === 'avatar') {
                const buffer = await part.toBuffer();
                if (buffer.length > 0) {
                    const base64Image = buffer.toString('base64');
                    data.avatar = `data:${part.mimetype};base64,${base64Image}`;
                }
            } else if (part.type === 'field' && part.fieldname === 'username') {
                if (part.value !== undefined) {
                    if (!isValidUsername(part.value)) {
                        return reply.code(400).send({ error: "Nom d'utilisateur invalide." });
                    }
                    data.username = part.value as string;
                }
            }
        }
    } catch (err) {
        return reply.code(400).send({ error: "Erreur lors du traitement des données ou du fichier." });
    }

    try{
        const updatedUser = await prisma.user.update({ where: { id: me.id }, data, select: userProfileSelect });
        const newToken = fastify.jwt.sign({ 
        username: updatedUser.username,
        userId: updatedUser.id 
    }, { expiresIn: '1h' });

    reply.setCookie('token', newToken, {
        path: '/',
        secure: true, 
        httpOnly: true,
        sameSite: 'lax'
    });
    return reply.send({ user: updatedUser });
    }
    catch (error: any) {
        if (error?.code === 'P2002')
            return reply.code(409).send({ error: "Cet username est déjà utilisé." });
        return reply.code(500).send({ error: "Erreur lors de l'update de la database." });
    }
}
