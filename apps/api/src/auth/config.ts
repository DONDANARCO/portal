import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  WEB_ORIGIN: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  DATABASE_URL: z.string().min(1),

  // For Entra multi-tenant, use the "common" or "organizations" authority.
  // We perform strict state/nonce/PKCE checks and then map users to onboarded tenants
  // via `tid` (preferred) or allowed email domains.
  OIDC_ISSUER_URL: z.string().url(),
  // Optional explicit discovery URL (e.g. Entra "common" well-known endpoint)
  // Example: https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
  OIDC_DISCOVERY_URL: z.string().url().optional(),
  OIDC_CLIENT_ID: z.string().min(1),
  OIDC_CLIENT_SECRET: z.string().min(1),
  OIDC_REDIRECT_URI: z.string().url(),

  // Comma-separated list of internal admin emails allowed to onboard tenants
  INTERNAL_ADMIN_EMAILS: z.string().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. Check apps/api/.env");
  }
  return parsed.data;
}

