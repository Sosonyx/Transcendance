

import fastifyOauth2 from "@fastify/oauth2";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const oauthPlugin = fp(async function (fastify: FastifyInstance) {
  await fastify.register(fastifyOauth2, {
    name: "intra42",
    scope: ["public"],
    credentials: {
      client: {
        id: process.env.INTRA_CLIENT_ID!,
        secret: process.env.INTRA_CLIENT_SECRET!,
      },
      auth: {
        authorizeHost: "https://api.intra.42.fr",
        authorizePath: "/oauth/authorize",
        tokenHost: "https://api.intra.42.fr",
        tokenPath: "/oauth/token",
      },
    },
    startRedirectPath: "/api/auth/42",
    callbackUri: "http://localhost:3000/api/auth/42/callback",
  });

  	fastify.register(fastifyOauth2, {
    name: "google",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/google",
    callbackUri: "http://localhost:3000/api/auth/google/callback",
  });
});