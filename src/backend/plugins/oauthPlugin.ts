

import fastifyOauth2 from "@fastify/oauth2";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { OAuth2AuthConfig } from "../types/fastify.js";

const intraAuth: OAuth2AuthConfig = {
  authorizeHost: "https://api.intra.42.fr",
  authorizePath: "/oauth/authorize",
  tokenHost: "https://api.intra.42.fr",
  tokenPath: "/oauth/token",
};

const googleAuth: OAuth2AuthConfig = {
  authorizeHost: "https://accounts.google.com",
  authorizePath: "/o/oauth2/v2/auth",
  tokenHost: "https://oauth2.googleapis.com",
  tokenPath: "/token",
};

export const oauthPlugin = fp(async function (fastify: FastifyInstance) {
  await fastify.register(fastifyOauth2, {
    name: "intra42",
    scope: ["public"],
    credentials: {
      client: {
        id: process.env.INTRA_CLIENT_ID!,
        secret: process.env.INTRA_CLIENT_SECRET!,
      },
      auth: intraAuth,
    },
    startRedirectPath: "/api/auth/42",
    callbackUri: "http://localhost:3000/api/auth/42/callback",
  });

  await fastify.register(fastifyOauth2, {
    name: "google",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      auth: googleAuth,
    },
    startRedirectPath: "/api/auth/google",
    callbackUri: "http://localhost:3000/api/auth/google/callback",
  });
});