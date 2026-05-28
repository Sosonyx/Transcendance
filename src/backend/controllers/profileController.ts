import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function getProfileController(req: FastifyRequest, reply: FastifyReply){
	try 
	{
		const currUser = req.user as {userId: string};
		const userProfile = await prisma.user.findUnique({ where : {id : currUser.userId}})						
		if (!userProfile)
			return (reply.status(404).send("Error, user not found !"))
		const {hashedPassword, ...safeProfile} = userProfile;
		return (reply.send(safeProfile))
	}
	catch (error){
		console.error("Profile error", error)
		return (reply.status(500).send({error : "Server error"}))
	}
}

export async function getOtherProfileController(req: FastifyRequest, reply: FastifyReply){
	const {userId} = req.params as {userId: string}
	const user = await prisma.user.findUnique({where: {id : userId}})
	if (!user)
	{
		console.error("Inexistant user!")
		return reply.status(404).send({error: "Inexistant user"})
	}
	const {hashedPassword, ...safeProfile} = user;
	return (safeProfile)
}

// export async function getLeaderbordController(req: FastifyRequest, reply: FastifyReply)
// {
// 	req;
// 	try
// 	{	
// 		const leaderbord = await prisma.gameStats.findMany({
// 			orderBy:{winrate : 'desc' },
// 			take : 10,
// 			include: {
// 				user: {
// 					select: {
// 						username : true,
// 						avatar: true
// 					}
// 				}
// 			}})
// 		return (reply.send(leaderbord))
// 	}
// 	catch (error){
// 		console.error("Erreur leaderboard:", error);
//     	return reply.status(500).send({ error: "Erreur serveur" });
// 	}
// }