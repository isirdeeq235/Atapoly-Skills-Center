import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"] as string | undefined;
  const ADMIN_KEY = process.env.ADMIN_API_KEY;
  if (!ADMIN_KEY) return res.status(500).json({ error: "Admin key not configured on server" });
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}