import bcrypt from "bcrypt";
import { prisma } from "../prisma/prisma.js";
import type { UserInterface, UserSafeInterface } from "../types/interfaces.js";
import type { FastifyRequest, FastifyReply } from "fastify";

export async function loginUser(currUser: Partial<UserInterface>) {
  if (!currUser.username || !currUser.password) {
    throw new Error("Missing username or password");
  }
  const user = await prisma.user.findUnique({
    where: { username: currUser.username }
  });
  if (!user || !user.hashedPassword) {
    throw new Error("Invalid credentials");
  }
  const validPassword = await bcrypt.compare(currUser.password, user.hashedPassword);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }
  const { hashedPassword, ...safeUser } = user;
  return (safeUser);
}


export async function registerUser(newUser: UserInterface): Promise<UserSafeInterface> { // Utiliser un type safe
  if (!newUser.password)
    throw new Error("Password is required");
  const hash = await bcrypt.hash(newUser.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: newUser.email,
      username: newUser.username,
      hashedPassword: hash,
      avatar: newUser.avatar || null,
    },
  });
  const { hashedPassword, ...safeUser } = user;
  return (safeUser);
}


export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true });
    const token = req.cookies?.token;
    if (token) {
      const blacklisted = await prisma.blacklistedToken.findUnique({ where: { token } });
      if (blacklisted) {
        return reply.code(401).send({ error: "Token expired, please reconnect" });
      }
    }
  } catch (error) {
    return reply.code(401).send({ error: "Need to be connected" });
  }
}
