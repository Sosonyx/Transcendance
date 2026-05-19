import Fastify from 'fastify';
import cookie from '@fastify/cookie';
// import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { healthRoutes } from './routes/healthRoutes.js';
import { friendRoutes } from './routes/friends.js';
const app = Fastify({ logger: true });
/*Protect the HTTP headers*/
await app.register(helmet);
/*Allow the front to communicate with back (API)*/
await app.register(cors, { origin: true, credentials: true });
await app.register(cookie);
// await app.register(jwt, { secret: process.env.JWT_SECRET! });
await app.register(healthRoutes);
await app.register(friendRoutes);
const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
