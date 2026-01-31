import { Router, Request, Response } from "express";

const router = Router();

const SERVER_BASE = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

router.post("/verify-payment", async (req: Request, res: Response) => {
  try {
    const resp = await fetch(`${SERVER_BASE}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const json = await resp.json();
    res.status(resp.status).json(json);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/send-email", async (req: Request, res: Response) => {
  try {
    const resp = await fetch(`${SERVER_BASE}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(req.body),
    });
    const json = await resp.json();
    res.status(resp.status).json(json);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/initialize-payment", async (req: Request, res: Response) => {
  try {
    const resp = await fetch(`${SERVER_BASE}/api/payments/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const json = await resp.json();
    res.status(resp.status).json(json);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/check-connections", async (_req, res) => {
  try {
    const resp = await fetch(`${SERVER_BASE}/api/system/check-connections`, {
      headers: { "x-admin-key": ADMIN_KEY },
    });
    const json = await resp.json();
    res.status(resp.status).json(json);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;