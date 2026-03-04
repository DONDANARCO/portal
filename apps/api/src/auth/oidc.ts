import * as oidc from "openid-client";
import type { Env } from "./config.js";

let cached:
  | {
      issuerUrl: string;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      config: oidc.Configuration;
    }
  | null = null;

export async function getOidcConfig(env: Env): Promise<oidc.Configuration> {
  if (
    cached &&
    cached.issuerUrl === env.OIDC_ISSUER_URL &&
    cached.clientId === env.OIDC_CLIENT_ID &&
    cached.clientSecret === env.OIDC_CLIENT_SECRET &&
    cached.redirectUri === env.OIDC_REDIRECT_URI
  ) {
    return cached.config;
  }

  const discoveryUrl = env.OIDC_DISCOVERY_URL ?? env.OIDC_ISSUER_URL;
  const config = await oidc.discovery(new URL(discoveryUrl), env.OIDC_CLIENT_ID, env.OIDC_CLIENT_SECRET);

  cached = {
    issuerUrl: env.OIDC_ISSUER_URL,
    clientId: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
    redirectUri: env.OIDC_REDIRECT_URI,
    config,
  };

  return config;
}

