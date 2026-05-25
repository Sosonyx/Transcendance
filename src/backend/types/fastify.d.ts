import { OAuth2Namespace } from "@fastify/oauth2";

export interface OAuth2AuthConfig {
  authorizeHost: string;
  authorizePath: string;
  tokenHost: string;
  tokenPath: string;
}

declare module "fastify" {
  interface FastifyInstance {
    google: OAuth2Namespace;
    intra42: OAuth2Namespace;
  }
}