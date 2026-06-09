import bcrypt from "bcrypt";
import { prisma } from "../../prisma/prisma.js";
import type { UserInterface } from "../types/interfaces.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { generateTwoFactorSecret, getUser, verifyTwoFactorToken } from "../utils/twoFactor.js";

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
  return (user);
}

export async function registerUser(newUser: UserInterface): Promise<Partial<UserInterface>> {
  if (!newUser.password) {
    throw new Error("Password is required for registration");
  }
  const hash = await bcrypt.hash(newUser.password, 10);
  const user = await prisma.user.create({
    data: {
      email: newUser.email,
      username: newUser.username,
      hashedPassword: hash,
      avatar: newUser.avatar || null,
    }
  });

  return user;
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

export async function setup2fa(req: FastifyRequest, reply: FastifyReply) {
  const user = await getUser(req, reply);

  if (!user)
      return (reply.code(400).send({ message: 'User not found in DB'}))
  if (user.twoFactorEnabled) {
    return reply.code(400).send({ message: '2FA already enabled' });
  }

  const { secret, qrCode } = await generateTwoFactorSecret(user.email);
  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { twoFactorTempSecret: secret }
  });

  return (reply.send({ qrCode }));
}

export async function verify2fa(req: FastifyRequest, reply: FastifyReply) {
  const user = await getUser(req, reply);
  if (!user)
      return (reply.code(400).send({ message: 'User not found in DB' }))
  if (!user.twoFactorTempSecret) {
    return (reply.code(400).send({ message: 'No 2FA setup in progress' }));
  }
  const { token } = req.body as { token: string };
  const isValidToken = verifyTwoFactorToken(token, user.twoFactorTempSecret);
  
  if (!isValidToken)
    return (reply.code(400).send({ message: 'Invalid token' }));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: user.twoFactorTempSecret,
      twoFactorTempSecret: null,
      twoFactorEnabled: true,
    },
  });

  return (reply.send({ message: '2FA enabled' }))
}

export async function validate2fa(req: FastifyRequest, reply: FastifyReply) {
  const { token } = req.body as { token: string };
  const user = await getUser(req, reply);
  
  if (!user) {
    return (reply.code(404).send({ error: "User not found in DB" }));
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return (reply.code(400).send({ message: '2FA not enabled' }));
  }

  const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!isValid) {
    return (reply.code(400).send({ message: 'Invalid token' }));
  }

  const newToken = req.server.jwt.sign({
    userId: user.id,
    username: user.username,
    twoFactorVerified: true
  });

  reply.setCookie('token', newToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  return (reply.send({ message: '2FA validation successful' }));
}

export async function disable2fa(req: FastifyRequest, reply: FastifyReply) {
  const { token } = req.body as { token: string };
  const user = await getUser(req, reply);
  
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return (reply.code(400).send({ message: '2FA not enabled' }));
  }
  
  const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!isValid) {
    return (reply.code(400).send({ message: 'Invalid token' }));
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      twoFactorEnabled: false, 
      twoFactorSecret: null,
      twoFactorTempSecret: null
    },
  });
  
  return (reply.send({ message: '2FA disabled' }));
}