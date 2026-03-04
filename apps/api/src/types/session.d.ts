import "express-session";

declare module "express-session" {
  interface SessionData {
    oidcState?: string;
    oidcNonce?: string;
    oidcPkceVerifier?: string;
    userId?: string;
    activeTenantId?: string;
    isInternalAdmin?: boolean;
  }
}

