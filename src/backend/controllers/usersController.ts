import type { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/multipart';
import { prisma } from '../prisma/prisma.js';
import type { JwtPayload } from '../types/interfaces.js';

const userProfileSelect = {
    id: true,
    email: true,
    username: true,
    avatar: true,
    playedAs: true,
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



export async function getUser(req: FastifyRequest, reply: FastifyReply){
   const jwtoken = req.cookies?.token;

  if (!jwtoken) {
    return (reply.code(401).send({ error: "User not connected" }));
  }

  const decoded = req.server.jwt.decode<JwtPayload>(jwtoken);
  if (!decoded) {
    return (reply.code(401).send({ error: "Invalid token" }));
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
        console.error("ÉCHEC JWT SUR LE PATCH :", jwtError);
        return reply.code(401).send({ error: "Unauthorized" });
    }

    const me = await getUser(request, reply);
    if (!me) 
        return reply.code(401).send({ error: "Unauthorized" });
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
                    data.username = part.value as string;
                }
            }
        }
    } catch (err) {
        return reply.code(400).send({ error: "Erreur lors du traitement des données ou du fichier" });
    }

    try{
        const updatedUser = await prisma.user.update({ where: { id: me.id }, data, select: userProfileSelect });
        console.log(me)
        const newToken = fastify.jwt.sign({ 
        username: updatedUser.username,
        userId: updatedUser.id 
    }, { expiresIn: '1h' });

    reply.setCookie('token', newToken, {
        path: '/',
        secure: false, 
        httpOnly: true,
        sameSite: 'lax'
    });
    return reply.send({ user: updatedUser });
    }
    catch (error) {
        return reply.code(500).send({ error: "Database update error" });
    }
}
