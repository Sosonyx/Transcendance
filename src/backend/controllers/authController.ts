import type { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, loginUser } from "../services/authService.js";
import { prisma } from "../prisma/prisma.js"
import type { JwtPayload, UserInterface } from "../types/interfaces.js"


function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

function  isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{5,}$/;
  return passwordRegex.test(password);
}

function validateFormData(data: Partial<UserInterface>): { isValid: boolean; reason?: string } {
  const { email, username, password } = data;
  
  if (!email || !isValidEmail(email))
    return { isValid: false, reason: "Adresse e-mail invalide." };
  if (!username || !isValidUsername(username))
    return { isValid: false, reason: "Nom d'utilisateur invalide. Il doit contenir entre 3 et 20 caractères alphanumériques ou underscores." };
  if (!password || !isValidPassword(password))
    return { isValid: false, reason: "Mot de passe invalide. Il doit contenir au moins 5 caractères, dont au moins une lettre et un chiffre." };
  
  return { isValid: true };
}

export async function registerController(req: FastifyRequest, reply: FastifyReply)
{
  let newUser: UserInterface = req.body as UserInterface;

  if (validateFormData(newUser).isValid === false)
    return reply.code(400).send({ error: validateFormData(newUser).reason });

  const validEmail = await prisma.user.findUnique({where :{email:newUser.email}})
  if (validEmail)
		return reply.code(409).send({ error: "Cet e-mail est déjà utilisé." });

  const validUsername = await prisma.user.findUnique({where :{username:newUser.username}})
  if (validUsername)
    return reply.code(409).send({ error: "Cet username est déjà utilisé." })

  const user: Partial<UserInterface>= await registerUser({
            email: newUser.email,
            username: newUser.username,
            password: newUser.password!,
            avatar: newUser.avatar,
            id: newUser.id
          });

  var token: string = req.server.jwt.sign({
            userId: user.id,
            username: user.username
          },
          { expiresIn: '1h' });
  reply.setCookie('token', token, { 
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 86400,
    path: '/'});
  return (reply.code(201).send({token, user}));
}

export async function loginController(req : FastifyRequest, reply : FastifyReply)
{
  try {
    const body = req.body as Partial <UserInterface>;

    const user = await loginUser(body);
    var token: string = req.server.jwt.sign({
        userId: user.id,
        username: user.username
    },
    { expiresIn: '1h' }
    );
  
    reply.setCookie('token', token, { 
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400,
        path: '/'
    });
    return (reply.send({token, user}));
  }catch (error) {
    return (reply.code(401).send({ error: "Identifiants de connexion invalides." }));
  }
}

export async function logoutController(req : FastifyRequest, reply: FastifyReply){
  const token : string | undefined = req.cookies.token;
  if (token === undefined)
      return (reply.code(400).send({ error: "Pas d'utilisateur connecté." }))
  try {
    const decoded = req.server.jwt.decode<JwtPayload>(token);
    await prisma.blacklistedToken.create({
      data: 
      {
        token : token as string,
        expiresAt: new Date(decoded!.exp * 1000)
      }})
    reply.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    return (reply.send({ error: 'Déconnecté.' }));
  }catch (error){
    return (reply.code(400).send({error: "Json web token invalide."}))
  }
}
