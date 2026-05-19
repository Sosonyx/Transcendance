import { prisma } from '../prisma.js';
export async function healthRoutes(app) {
    // Simple healthcheck
    app.get("/health", async () => {
        return { ok: true };
    });
    // Server AND db healhcheck
    app.get("/health/db", async (request, reply) => {
        try {
            await prisma.$queryRaw `SELECT 1`;
            return { ok: true, db: "connected" };
        }
        catch {
            return reply.status(503).send({ ok: false, db: 'unreachable' });
        }
    });
}
