import type { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, loginUser } from "../services/authService.js";
import { prisma } from "../lib/prisma.js"
import type { userInterface } from "../types/interfaces.js"

export async function registerController(req: FastifyRequest, reply: FastifyReply)
{
  let newUser: userInterface = req.body as userInterface;
  
  const validEmail = await prisma.user.findUnique({where :{email:newUser.email}})
  if (validEmail)
		throw new Error("Invalid Email");

  const validUsername = await prisma.user.findUnique({where :{username:newUser.username}})
  if (validUsername)
		throw new Error("Invalid username");

  const user = await registerUser({email: newUser.email, username: newUser.username, password: newUser.password, avatar: newUser.avatar, id : null});
  var token: string = req.server.jwt.sign({ userId: user.id, username: user.username }, { expiresIn: '1h' });
  reply.setCookie('token', token, { httpOnly: false, secure: false /* true en prod (HTTPS seulement)*/, sameSite: 'strict', maxAge: 86400, path: '/'});
  return reply.status(201).send({token, user});
}

export async function loginController(req : FastifyRequest, reply : FastifyReply){
  const body = req.body as Partial <userInterface>;
  const user = await loginUser(body);
  var token: string = req.server.jwt.sign({ userId: user.id, username: user.username }, { expiresIn: '1h' });
  reply.setCookie('token', token, { httpOnly: false, secure: false /* true en prod (HTTPS seulement)*/, sameSite: 'strict', maxAge: 86400, path: '/'});
  return reply.send({token, user});
}

export async function logoutController(req : FastifyRequest, reply: FastifyReply){
  const token = req.cookies.token;
  const decoded = req.server.jwt.decode<{ exp: number }>(token);

  await prisma.blacklistedToken.create({data: {token : token as string, expiresAt: new Date(decoded!.exp * 1000)}})
  reply.clearCookie('token', {httpOnly: false, secure: false, sameSite: 'strict', path: '/' });
  return reply.send({ message: 'Deconnecte' });
}   