import { prisma } from "../lib/prisma.js"
import type { FastifyInstance } from "fastify";
import type { oAuthProfile } from "../types/interfaces.js";

export async function handleOAuthLogin(fastify: FastifyInstance, provider: string, profile: oAuthProfile){
    // Conversion explicite en String pour Prisma (à l'exécution)
    const normalizedProviderId = String(profile.providerId);

    let oAuthAccount = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId: normalizedProviderId
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
                providerId: normalizedProviderId, // Utilisation de la String ici aussi
                userId: user.id
            },
            include: { user: true }
        })
    }
    const token = fastify.jwt.sign({ userId: oAuthAccount.user.id, username: oAuthAccount.user.username },{ expiresIn: "24h" })
    return { token, user: oAuthAccount.user };
}

async function generateUsername(base: string | undefined | null, email?: string): Promise<string> {
  // Si le pseudo est absent, on essaie de prendre le début de l'email, ou à défaut "player"
  let sourceName = base;
  if (!sourceName || typeof sourceName !== 'string') {
    sourceName = email ? email.split('@')[0] : "player";
  }
  const clean = sourceName!.replace(/\s+/g, "_").toLowerCase();

  const existing = await prisma.user.findUnique({ where: { username: clean } });
  if (!existing) 
    return clean;

  return `${clean}_${Math.floor(Math.random() * 9999)}`;
}