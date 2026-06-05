import Fastify from 'fastify';
import 'dotenv/config';
import fastifyStatic from '@fastify/static';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initRoutes } from './routes/initRoutes.js'

export const app = Fastify({ logger: true });

// TODO: TEMPORARY
    {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // console.error(__dirname)
        await app.register(fastifyStatic, {
            root: path.resolve(__dirname, '/home/tlecuyer/trensendence/src/frontend/'),

        });
    }

app.get('/', (request, reply) => {
    request;
    return reply.sendFile('frontend/public/index_2.html');
});

await app.register(initRoutes);

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();