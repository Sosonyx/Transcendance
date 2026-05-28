import Fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { initRoutes } from './backend/routes/initRoutes.js';
import { registerSocketHandlers } from './game/socket/index.js';


export const fastify = Fastify();

fastify.addHook('onRequest', (request, reply, done) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5174');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (request.method === 'OPTIONS') {
        reply.code(204).send();
        return;
    }

    done();
}); // TEMP, Autoriser fastify a call vite serv

fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'build/frontend')
});

fastify.get('/', (request, reply) => {
    request;
    return reply.sendFile('index.html');
});

fastify.setNotFoundHandler((request, reply) => {
    if (request.method === 'GET' && !request.url.startsWith('/api') && !request.url.startsWith('/health')) {
        return reply.sendFile('index.html');
    }

    return reply.code(404).send({ message: 'Not Found' });
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
