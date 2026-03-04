import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function requireTenantAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const tenantId = req.session.activeTenantId;

  if (!userId) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  if (!tenantId) {
    res.status(400).json({ error: "no_active_tenant" });
    return;
  }

  const membership = await prisma.tenantMembership.findFirst({ where: { userId, tenantId } });
  if (!membership) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  if (membership.role !== "client_admin") {
    res.status(403).json({ error: "requires_client_admin" });
    return;
  }

  next();
}

