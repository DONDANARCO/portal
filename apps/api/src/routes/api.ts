import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireInternalAdmin } from "../middleware/requireInternalAdmin.js";
import { requireTenantAdmin } from "../middleware/requireTenantAdmin.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.get("/me", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    req.session.userId = undefined;
    req.session.activeTenantId = undefined;
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  const memberships = await prisma.tenantMembership.findMany({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });

  const activeTenantId = req.session.activeTenantId ?? memberships[0]?.tenantId ?? null;
  const activeTenant = memberships.find((m) => m.tenantId === activeTenantId)?.tenant ?? null;

  res.json({
    user,
    isInternalAdmin: Boolean(req.session.isInternalAdmin),
    activeTenantId,
    activeTenant,
    tenants: memberships.map((m) => ({
      id: m.tenantId,
      name: m.tenant.name,
      role: m.role,
      status: m.tenant.status,
    })),
  });
});

apiRouter.post("/tenants/active", requireAuth, async (req, res) => {
  const Body = z.object({ tenantId: z.string().min(1) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  const userId = req.session.userId!;
  const membership = await prisma.tenantMembership.findFirst({
    where: { userId, tenantId: parsed.data.tenantId },
  });
  if (!membership) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  req.session.activeTenantId = parsed.data.tenantId;
  res.status(204).end();
});

apiRouter.post("/admin/tenants", requireInternalAdmin, async (req, res) => {
  const Body = z.object({
    name: z.string().min(2),
    entraTenantId: z.string().min(8).optional(),
    domains: z.array(z.string().min(3)).default([]),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: parsed.data.name,
      entraTenantId: parsed.data.entraTenantId,
      domains: {
        create: parsed.data.domains.map((d) => ({ domain: d.toLowerCase() })),
      },
    },
  });

  // By default, make the onboarding admin a client_admin of this new tenant.
  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: req.session.userId! } },
    update: { role: "client_admin" },
    create: { tenantId: tenant.id, userId: req.session.userId!, role: "client_admin" },
  });

  res.status(201).json({ id: tenant.id });
});

apiRouter.get("/tenant/members", requireAuth, async (req, res) => {
  const tenantId = req.session.activeTenantId;
  const userId = req.session.userId!;
  if (!tenantId) {
    res.status(400).json({ error: "no_active_tenant" });
    return;
  }

  const membership = await prisma.tenantMembership.findFirst({ where: { userId, tenantId } });
  if (!membership) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const members = await prisma.tenantMembership.findMany({
    where: { tenantId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.json({
    tenantId,
    members: members.map((m) => ({
      userId: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      createdAt: m.createdAt,
    })),
    canManage: membership.role === "client_admin",
  });
});

apiRouter.post("/tenant/members/role", requireTenantAdmin, async (req, res) => {
  const tenantId = req.session.activeTenantId!;
  const Body = z.object({
    email: z.string().email(),
    role: z.enum(["client_admin", "client_user"]),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    res.status(404).json({
      error: "user_not_found",
      message: "User must sign in at least once before they can be added.",
    });
    return;
  }

  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId, userId: user.id } },
    update: { role: parsed.data.role },
    create: { tenantId, userId: user.id, role: parsed.data.role },
  });

  res.status(204).end();
});

