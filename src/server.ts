import Fastify from 'fastify';
import 'dotenv/config';
import fastifyStatic from '@fastify/static';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './backend/game/socket/index.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initRoutes } from './backend/routes/initRoutes.js'

export const fastify = Fastify({ logger: true });

// TODO: TEMPORARY
    {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // console.error(__dirname)
        await fastify.register(fastifyStatic, {
            root: path.resolve(__dirname, '../public'),

        });
    }

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

fastify.listen({ port: 3000, host: '0.0.0.0'}, () => {
    console.log('Serveur lancé sur le port 3000');
});
