import type { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, loginUser } from "../services/authService.js";
import { prisma } from "../prisma/prisma.js";
import type { UserInterface } from "../types/interfaces.js"

export async function registerController(req: FastifyRequest, reply: FastifyReply)
{
  let newUser: UserInterface = req.body as UserInterface;
  
  const validEmail = await prisma.user.findUnique({where :{email:newUser.email}})
  if (validEmail)
		throw new Error("Invalid Email");

  const validUsername = await prisma.user.findUnique({where :{username:newUser.username}})
  if (validUsername)
		throw new Error("Invalid username");

  const user: Partial<UserInterface>= await registerUser({
            email: newUser.email,
            username: newUser.username,
            password: newUser.password,
            avatar: newUser.avatar,
            id: newUser.id
          });

  var token: string = req.server.jwt.sign({
            userId: user.id,
            username: user.username
          },
          { expiresIn: '1h' });
  reply.setCookie('token', token, { httpOnly: true, secure: false /* true en prod (HTTPS seulement)*/, sameSite: 'lax', maxAge: 86400, path: '/'});
  return reply.status(201).send({token, user});
}

export async function loginController(req : FastifyRequest, reply : FastifyReply)
{
  const body = req.body as Partial <UserInterface>;
  const user = await loginUser(body);
  var token: string = req.server.jwt.sign({ userId: user.id, username: user.username }, { expiresIn: '1h' });
  reply.setCookie('token', token, { httpOnly: true, secure: false /* true en prod (HTTPS seulement)*/, sameSite: 'lax', maxAge: 86400, path: '/'});
  return reply.send({token, user});
}

export async function logoutController(req : FastifyRequest, reply: FastifyReply){
  const token = req.cookies.token;
    const decoded = token ? req.server.jwt.decode<{ exp?: number }>(token as string) : null;
  
    if (token) {
      let expiresAt: Date | null = null;
      if (decoded && typeof decoded.exp === 'number') {
        expiresAt = new Date(decoded.exp * 1000);
      } else {
        expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      }
      await prisma.blacklistedToken.create({ data: { token: token as string, expiresAt } });
    }
  reply.clearCookie('token', {httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
  return reply.send({ message: 'Deconnecte' });
}   