import { TOTP } from "otpauth";
import QRCode from 'qrcode';
import type { TwoFactorSecret, JwtPayload } from "../types/interfaces.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import {prisma} from '../lib/prisma.js'

export async function generateTwoFactorSecret(userEmail: string): Promise<TwoFactorSecret> {
  const totp = new TOTP({ // Time Based One time Password
    issuer: 'Transcendence',
    label: userEmail,
    algorithm: 'SHA1', //Hachage avec algo + temps
    digits: 6, // 6 digits code
    period: 30, // Refresh every 30s 
  });
  const secret = totp.secret.base32; // Totp generate secret from higly random numbers 
  const otpauthUrl = totp.toString();
  const qrCode = await QRCode.toDataURL(otpauthUrl); // Transform otpauthUrl to qr code data

  const twoFactorInfos: TwoFactorSecret  = {
	secret: secret,
	otpauthUrl: otpauthUrl,
	qrCode: qrCode
  }
  return (twoFactorInfos)
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  const totp = new TOTP({ secret });
  const delta = totp.validate({ token, window: 1 });
  if (delta === null)
	  return (false)
  else
	  return (true)
}

export async function getUser(req: FastifyRequest, reply: FastifyReply){
   const jwtoken = req.cookies?.token;

  if (!jwtoken) {
    return (reply.code(401).send({ error: "User not connected" }));
  }

  const decoded = req.server.jwt.decode<JwtPayload>(jwtoken);
  if (!decoded) {
    return (reply.code(401).send({ error: "Invalid token" }));
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  return (user)
}