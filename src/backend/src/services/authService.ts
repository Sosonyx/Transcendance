import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import type { userInterface } from "../types.js"
import type { FastifyRequest } from "fastify/types/request.js";
import type { FastifyReply } from "fastify/types/reply.js";


export async function loginUser(currUser : Partial <userInterface>) 
{
  const user = await prisma.user.findUnique({where : { username : currUser.username as string}})
	if (!user)
		throw new Error("Invalid credentials");

  const validPassword = await bcrypt.compare(currUser.password as string, user.hashedPassword)
	if (!validPassword)
    throw new Error("Invalid credentials");
  return user;
}

export async function registerUser(newUser: userInterface) : Promise<Partial<userInterface>>
{
  const hash = await bcrypt.hash(newUser.password, 10);
  const user = await prisma.user.create({ data :{ email: newUser.email, username: newUser.username, hashedPassword: hash, avatar : newUser.avatar ? newUser.avatar : null}})

  return (user);
}

export async function verifAuth(request : FastifyRequest, reply : FastifyReply) {
  try {
    await request.jwtVerify({onlyCookie: true});
  } catch (err) {
    reply.code(401).send({ error: 'Accès non autorisé : Token invalide ou absent' });
  }
}