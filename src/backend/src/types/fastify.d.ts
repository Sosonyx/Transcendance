import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    google: OAuth2Namespace;
    intra42: OAuth2Namespace;
  }
}