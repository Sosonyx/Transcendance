import Fastify from 'fastify';
import { authRoutes } from "./routes/authRoutes.js"
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';

import { healthRoutes } from './routes/healthRoutes.js';
import { friendsRoutes } from './routes/friendsRoutes.js';
import { profilRoutes, modifyUserRoutes } from './routes/usersRoutes.js';


import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';


export const app = Fastify({ logger: true });

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


// console.log("👉 MON DOSSIER PUBLIC EST RECHERCHÉ ICI :", publicPath);
await app.register(fastifyStatic, {
    root: path.resolve(dirname, '../../public'),
});

await app.register(authRoutes);

await app.register(fastifyCookie, {secret: 'COOKIESECRET'});

// Configure fastify-jwt to read the token from the cookie named 'token'
await app.register(fastifyJwt, {
	secret: 'JWTSECRET',
	cookie: { cookieName: 'token', signed: false }
});

await app.register(healthRoutes);
await app.register(friendsRoutes);
await app.register(profilRoutes);
await app.register(modifyUserRoutes);


const start = async () => {
	try 
	{
		await app.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) 
	{
		app.log.error(err);
		process.exit(1);
	}
};

start();
