import type { Request, Response, NextFunction } from "express";

export function requireInternalAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  if (!req.session.isInternalAdmin) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  next();
}

