import { prisma } from '../prisma.js';
import { User, Friendship } from '@prisma/client';
export async function friendRoutes(app) {
    /*username is dynamic (:username) */
    app.post("/api/friend/:username", async (req, res) => {
        const { username } = req.params;
        const me = req.user;
        // console.log(username)
    });
}
