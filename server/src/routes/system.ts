import { Router } from "express";
import prisma from "../lib/prisma";
import fs from "fs";

const router = Router();

router.get("/check-connections", async (_req, res) => {
  const now = new Date().toISOString();
  const result: any = {
    database: { name: "Database", status: "disconnected", message: "", lastChecked: now },
    smtp: { name: "Email (SMTP)", status: "not_configured", message: "", lastChecked: now },
    paystack: { name: "Paystack", status: "not_configured", message: "", lastChecked: now },
    flutterwave: { name: "Flutterwave", status: "not_configured", message: "", lastChecked: now },
    storage: { name: "File Storage", status: "disconnected", message: "", lastChecked: now },
  };

  // DB check
  try {
    // Prisma exposes model clients in camelCase (SiteConfig -> siteConfig)
    await prisma.siteConfig.findFirst();
    result.database = { name: "Database", status: "connected", message: "Database is connected and responding", lastChecked: now, details: {} };
  } catch (e: any) {
    result.database = { name: "Database", status: "error", message: e.message, lastChecked: now };
  }

  // storage check (uploads dir)
  try {
    const uploadDir = `${process.cwd()}/uploads`;
    const exists = fs.existsSync(uploadDir);
    result.storage = { name: "File Storage", status: exists ? "connected" : "not_configured", message: exists ? "Local uploads available" : "uploads directory missing", lastChecked: now };
  } catch (e: any) {
    result.storage = { name: "File Storage", status: "error", message: e.message, lastChecked: now };
  }

  // SMTP check
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
  if (smtpHost && smtpPort && smtpUser && smtpPass) result.smtp = { name: "Email (SMTP)", status: "connected", message: "SMTP credentials configured", lastChecked: now, details: { host: smtpHost, port: smtpPort, from_email: smtpFromEmail || null } };
  else result.smtp = { name: "Email (SMTP)", status: "not_configured", message: "Missing SMTP env vars", lastChecked: now };

  // Paystack
  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (paystackKey) {
    try {
      const r = await fetch("https://api.paystack.co/balance", { headers: { Authorization: `Bearer ${paystackKey}` } });
      if (r.ok) result.paystack = { name: "Paystack", status: "connected", message: "Paystack API key valid", lastChecked: now };
      else {
        const data = await r.json();
        result.paystack = { name: "Paystack", status: "error", message: data?.message || "Invalid API key", lastChecked: now };
      }
    } catch (e: any) {
      result.paystack = { name: "Paystack", status: "error", message: e.message, lastChecked: now };
    }
  }

  // Flutterwave
  const fwKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (fwKey) {
    try {
      const r = await fetch("https://api.flutterwave.com/v3/balances", { headers: { Authorization: `Bearer ${fwKey}` } });
      if (r.ok) result.flutterwave = { name: "Flutterwave", status: "connected", message: "Flutterwave API key valid", lastChecked: now };
      else {
        const data = await r.json();
        result.flutterwave = { name: "Flutterwave", status: "error", message: data?.message || "Invalid API key", lastChecked: now };
      }
    } catch (e: any) {
      result.flutterwave = { name: "Flutterwave", status: "error", message: e.message, lastChecked: now };
    }
  }

  res.json({ success: true, connections: result });
});

export default router;