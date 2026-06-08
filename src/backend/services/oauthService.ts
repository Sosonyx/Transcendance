import { prisma } from "../prisma/prisma.js"
import type { FastifyInstance } from "fastify";
import type { oAuthProfile } from "../types/interfaces.js";

export async function handleOAuthLogin(fastify: FastifyInstance, provider: string, profile: oAuthProfile){
	let oAuthAccount = await prisma.oAuthAccount.findUnique({
		where: {
		  provider_providerId: {
			provider,
			providerId: profile.providerId
		}
    },
	include: {user: true}
	})
	if (!oAuthAccount){
		let user = await prisma.user.findUnique({where: {email: profile.email }})
		if (!user){
			user = await prisma.user.create({
				data: {
					email: profile.email,
					username: await generateUsername(profile.username)
				}
			})
		}
		oAuthAccount = await prisma.oAuthAccount.create({
			data:{
				provider: provider,
				providerId: profile.providerId.toString(),
				userId: user.id
			},
			include: { user: true }
		})
	}
	const token = fastify.jwt.sign({ userId: oAuthAccount.user.id, username: oAuthAccount.user.username },{ expiresIn: "24h" })
	console.log(oAuthAccount)
	return { token, user: oAuthAccount.user };
}

async function generateUsername(base: string): Promise<string> {
  const clean = base.replace(/\s+/g, "_").toLowerCase();

  const existing = await prisma.user.findUnique({ where: { username: clean } });
  if (!existing) 
	return clean;

  return `${clean}_${Math.floor(Math.random() * 9999)}`;
}