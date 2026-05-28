import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../backend/llm/.env') });

import Fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { registerSocketHandlers } from './socket/index.js';

export const fastify = Fastify();

fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'public')
});

fastify.get('/', (request, reply) => {
    request;
    return reply.sendFile('index.html');
});

console.log('Fastify is now ready ;)');

const io = new Server(fastify.server, {
    connectionStateRecovery: {}
});

registerSocketHandlers(io);

fastify.listen({ port: 3000 }, () => {
    console.log('Serveur lancé sur le port 3000');
});
