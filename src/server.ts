import Fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { registerSocketHandlers } from './socket/index.js';

const fastify = Fastify();

fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'public')
});
// await fastify.ready();
console.log('Fastify is now ready ;)');


const io = new Server(fastify.server, {
    connectionStateRecovery: {}
});

registerSocketHandlers(io);

fastify.listen({ port: 3000 }, () => {
    console.log('Serveur lancé sur le port 3000');
});

