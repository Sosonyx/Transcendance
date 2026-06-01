import type { FastifyRequest, FastifyReply } from "fastify";
import type { DBUserResponse, Player, UserMap, UserSafeInterface, UserInterface } from "../types/interfaces.js";
import { prisma } from "../lib/prisma.js";

export async function getProfileController(req: FastifyRequest, reply: FastifyReply){
	try 
	{
		const currUser = req.user as {userId: string};
		const userProfile = await prisma.user.findUnique({ where : {id : currUser.userId}})						
		if (!userProfile)
			return (reply.status(404).send("Error, user not found !"))
		return (reply.send(user))
	}
	catch (error){
		console.error("Profile error", error)
		return (reply.status(500).send({error : "Server error"}))
	}
}

export async function getOtherProfileController(req: FastifyRequest, reply: FastifyReply){
	const {username} = req.params as {username: string}
	const user = await prisma.user.findUnique({where: {username : username}})
	if (!user)
	{
		console.error("Inexistant user!")
		return reply.status(404).send({error: "Inexistant user"})
	}
	const {hashedPassword, ...safeProfile} = user;
	return (safeProfile)
}

