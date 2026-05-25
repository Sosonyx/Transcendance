import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import type { userInterface } from "../types/interfaces.js"
import type { FastifyRequest } from "fastify/types/request.js";
import type { FastifyReply } from "fastify/types/reply.js";


export async function loginUser(currUser : Partial <userInterface>) 
{
  const user = await prisma.user.findUnique({
    where : {
      username : currUser.username as string}})
	if (!user)
		throw new Error("Invalid credentials");

  const validPassword = await bcrypt.compare(currUser.password as string, user.hashedPassword as string)
	if (!validPassword)
    	throw new Error("Invalid credentials");
  return user;
}

export async function registerUser(newUser: userInterface) : Promise<Partial<userInterface>>
{
  const hash = await bcrypt.hash(newUser.password, 10);
  const user = await prisma.user.create({
    data :{
      email: newUser.email,
      username: newUser.username, 
      hashedPassword: hash, 
      avatar : newUser.avatar ? newUser.avatar : null,
    Stats: {
      create: {
          numberOfGames: 0,
          gamesWin: 0,
          gamesLose: 0,
          winrate: 0.0,
        }
      }
    },
    include: {
      Stats: true
    }})

  return (user);
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({onlyCookie: true});
    const token = req.cookies.token
    if (token){
      const blacklisted = await prisma.blacklistedToken.findUnique({ where: { token : token }});
      if (blacklisted) {
        return reply.code(401).send({ error: "Token expired, please reconnect" });
      }
    }
  } catch (error) {
    return reply.code(401).send({ error: "Need to be connected" });
  }
}