import type { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, loginUser } from "../services/authService.js";
import { prisma } from "../lib/prisma.js"
import type { userInterface } from "../types.js"

export async function registerController(req: FastifyRequest, reply: FastifyReply) : Promise<userInterface>
{
  let newUser: userInterface = req.body as userInterface;
  const validEmail = await prisma.user.findUnique({where :{email:newUser.email}})
  if (validEmail)
		throw new Error("Invalid Email");
  console.log(newUser);

  const validUsername = await prisma.user.findUnique({where :{username:newUser.username}})
  if (validUsername)
		throw new Error("Invalid username");

  const user = await registerUser({email: newUser.email, username: newUser.username, password: newUser.password, avatar: newUser.avatar});
  var token: string = req.server.jwt.sign({username: user.username}, { expiresIn: '1h' });
  reply.setCookie('token', token);
  return reply.status(201).send(user);
}

export async function loginController(req : FastifyRequest, reply : FastifyReply){
  const body = req.body as Partial <userInterface>;
  const user = await loginUser(body);
	console.log("LOGIN OK :", user);
  var token: string = req.server.jwt.sign({username: user.username}, { expiresIn: '1h' });
  reply.setCookie('token', token);
  console.log(reply)
  return reply.send(user);
}

export async function logoutController(req : FastifyRequest, reply: FastifyReply){
  reply.clearCookie('token', {path : '/'});
  return ({message: 'Deconnecte'});
}