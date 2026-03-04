import { Router } from "express";
import * as oidc from "openid-client";
import type { Env } from "./config.js";
import { getOidcConfig } from "./oidc.js";
import { prisma } from "../db.js";

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  return email.slice(at + 1).toLowerCase();
}

async function resolveTenantForEmail(email: string) {
  const domain = emailDomain(email);
  if (!domain) return null;
  const match = await prisma.tenantDomain.findFirst({
    where: { domain },
    include: { tenant: true },
  });
  return match?.tenant ?? null;
}

async function ensureMembership(userId: string, tenantId: string) {
  const existing = await prisma.tenantMembership.findFirst({ where: { userId, tenantId } });
  if (existing) return existing;

  const anyMembership = await prisma.tenantMembership.findFirst({ where: { tenantId } });
  const role = anyMembership ? "client_user" : "client_admin";

  return prisma.tenantMembership.create({
    data: { userId, tenantId, role },
  });
}

export function authRouter(env: Env) {
  const router = Router();

  router.get("/login", async (req, res, next) => {
    try {
      const config = await getOidcConfig(env);

      const state = oidc.randomState();
      const nonce = oidc.randomNonce();
      const pkceVerifier = oidc.randomPKCECodeVerifier();
      const pkceChallenge = await oidc.calculatePKCECodeChallenge(pkceVerifier);

      req.session.oidcState = state;
      req.session.oidcNonce = nonce;
      req.session.oidcPkceVerifier = pkceVerifier;

      const url = oidc.buildAuthorizationUrl(config, {
        redirect_uri: env.OIDC_REDIRECT_URI,
        scope: "openid profile email",
        state,
        nonce,
        code_challenge: pkceChallenge,
        code_challenge_method: "S256",
      });

      res.redirect(url.href);
    } catch (err) {
      next(err);
    }
  });

  router.get("/callback", async (req, res, next) => {
    try {
      const config = await getOidcConfig(env);

      const currentUrl = new URL(env.OIDC_REDIRECT_URI);
      const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      currentUrl.search = qs;

      const tokens = await oidc.authorizationCodeGrant(
        config,
        currentUrl,
        {
          expectedState: req.session.oidcState,
          expectedNonce: req.session.oidcNonce,
          pkceCodeVerifier: req.session.oidcPkceVerifier,
        },
      );

      const claims = tokens.claims();
      if (!claims) {
        res.status(400).send("OIDC login succeeded but no id_token was returned.");
        return;
      }

      const provider = env.OIDC_ISSUER_URL;
      const subject = claims.sub;
      const email =
        (claims.email as string | undefined) ??
        (claims.preferred_username as string | undefined) ??
        (claims.upn as string | undefined);

      if (!subject || !email) {
        res.status(400).send("OIDC login succeeded but no (sub/email) claims were present.");
        return;
      }

      const name =
        ((claims.name as string | undefined) ??
          [claims.given_name, claims.family_name].filter(Boolean).join(" ").trim()) ||
        undefined;

      const user = await prisma.user.upsert({
        where: { email },
        update: { name, authProvider: provider, authSubject: subject },
        create: { email, name, authProvider: provider, authSubject: subject },
      });

      const internalAdminEmails = env.INTERNAL_ADMIN_EMAILS.split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const isInternalAdmin = internalAdminEmails.includes(email.toLowerCase());
      req.session.isInternalAdmin = isInternalAdmin;

      // Prefer Entra tenant ID mapping when present
      const tid = (claims.tid as string | undefined) ?? undefined;
      const tenant =
        (tid ? await prisma.tenant.findFirst({ where: { entraTenantId: tid } }) : null) ??
        (await resolveTenantForEmail(email));

      if (tenant) {
        await ensureMembership(user.id, tenant.id);
        req.session.activeTenantId = tenant.id;
      } else {
        // User authenticated, but is not mapped to an onboarded tenant yet.
        // Only internal admins are allowed to proceed without a tenant membership.
        if (!isInternalAdmin) {
          res.status(403).send("Your account is not associated with an onboarded tenant. Please contact support.");
          return;
        }
        req.session.activeTenantId = undefined;
      }

      req.session.userId = user.id;
      req.session.oidcState = undefined;
      req.session.oidcNonce = undefined;
      req.session.oidcPkceVerifier = undefined;

      res.redirect(env.WEB_ORIGIN);
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("portal.sid");
      res.status(204).end();
    });
  });

  return router;
}

