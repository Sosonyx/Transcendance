import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';


import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initRoutes } from './routes/initRoutes.js'


export const app = Fastify({ logger: true });

    {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        await app.register(fastifyStatic, {
            root: path.resolve(__dirname, '../../public'),                                
        });
    }
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