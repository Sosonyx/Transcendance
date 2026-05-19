import Fastify from 'fastify';
import {authRoutes} from "./routes/authRoutes.js"
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';

export const app = Fastify({ logger: true });

await app.register(authRoutes);

await app.register(fastifyCookie, {secret: 'COOKIESECRET'});

await app.register(fastifyJwt, {secret: 'JWTSECRET'});


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