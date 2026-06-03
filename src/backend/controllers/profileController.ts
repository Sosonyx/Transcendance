import type { FastifyRequest, FastifyReply } from "fastify";
import type { DBUserResponse, Player, UserMap, UserSafeInterface, UserInterface } from "../types/interfaces.js";
import { prisma } from "../prisma/prisma.js";

export async function getProfileController(req: FastifyRequest, reply: FastifyReply){
	try 
	{
		const currUser = req.user as {userId: string};
		const dbUser  = await prisma.user.findUnique({ where : {id : currUser.userId}, include:{playedAs: true}})						
		if (!dbUser) {
       		 console.error("Inexistant user!");
        	return reply.status(404).send({ error: "Inexistant user" });
    	}
		const user : UserSafeInterface = {
			id: dbUser.id,
			email: dbUser.email,
			username: dbUser.username,
			avatar: dbUser.avatar,
			playedAs: dbUser.playedAs
		}
		console.log(dbUser)
		if (!user)
			return (reply.status(404).send("Error, user not found !"))
		return (reply.send(user))
	}
	catch (error){
		console.error("Profile error", error)
		return (reply.status(500).send({error : "Server error"}))
	}
}

export async function getOtherProfileController(req: FastifyRequest, reply: FastifyReply){

    const { username } = req.params as { username: string };
    const dbUser = await prisma.user.findUnique({where: { username: username }});

    if (!dbUser) {
        console.error("Inexistant user!");
        return reply.status(404).send({ error: "Inexistant user" });
    }

    const user: UserInterface = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        avatar: dbUser.avatar,
        password: dbUser.hashedPassword,
    };

    const safeProfile: UserSafeInterface = user;
    return (reply.send(safeProfile));
}

function getUserMap(user : DBUserResponse): UserMap{
    const games: Player[]   = user.playedAs;
    const total: number   = games.length;
    const won: number     = games.filter((p: Player) => p.won).length;
    const winrate: number = total > 0 ? Math.round((won / total) * 100) : 0;
    
    return {
        id:            user.id,
        username:      user.username,
        avatar:        user.avatar ? user.avatar : null,
        numberOfGames: total,
        gamesWon:      won,
        winrate,
    };
}

export async function getLeaderbordController(){
	const users : DBUserResponse[] = await prisma.user.findMany({
	include: {
		playedAs: {
		where: { status: 'user' }
		}
	}
	})
	const userMap : UserMap[] = users.map(getUserMap)
	const filteredMap = userMap.filter(user => user.numberOfGames > 0)
	const sortedMap = filteredMap.sort((a, b) => b.winrate - a.winrate)
	const leaderboard = sortedMap.slice(0, 10) 

	return (leaderboard)
}
