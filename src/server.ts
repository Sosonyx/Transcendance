import Fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { initRoutes } from './backend/routes/initRoutes.js';
import { registerSocketHandlers } from './game/socket/index.js';


export const fastify = Fastify();

fastify.addHook('onRequest', (request, reply, done) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (request.method === 'OPTIONS') {
        reply.code(204).send();
        return;
    }

    done();
});

fastify.register(fastifyStatic, {
    root: join(process.cwd(), '.')
});

fastify.get('/', (request, reply) => {
    request;
    return reply.sendFile('index.html');
});

await fastify.register(initRoutes);

console.log('Fastify is now ready ;)');

const io = new Server(fastify.server, {
    connectionStateRecovery: {}
});

registerSocketHandlers(io);

fastify.listen({ port: 3000 }, () => {
    console.log('Serveur lancé sur le port 3000');
});
