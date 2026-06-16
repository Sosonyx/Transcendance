import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import multipart from '@fastify/multipart';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../backend/llm/.env') });

import Fastify from 'fastify';
import { Server } from 'socket.io';
// import fastifyStatic from '@fastify/static';
// import { join } from 'path';
import { registerSocketHandlers } from './game/socket/index.js';
import { initRoutes } from './routes/initRoutes.js'


export const fastify = Fastify({logger : true});

await fastify.register(multipart, {
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    }
});

await fastify.register

const io = new Server(fastify.server, {
    connectionStateRecovery: {}
});

registerSocketHandlers(io);
await fastify.register(initRoutes);

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => {
    console.log('stop container backend');
    process.exit(0);
});

start();