import Fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { initRoutes } from './backend/routes/initRoutes.js';
import { registerSocketHandlers } from './game/socket/index.js';


export const fastify = Fastify();

fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'public')
});

fastify.get('/', (request, reply) => {
    request;
    return reply.sendFile('index_2.html');
});

await fastify.register(initRoutes);

console.log('Fastify is now ready ;)');

const io = new Server(fastify.server, {
    connectionStateRecovery: {}
});

registerSocketHandlers(io);

const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 3000;

fastify.listen({ port: BACKEND_PORT }, () => {
    console.log(`Serveur lancé sur le port ${BACKEND_PORT}`);
});
