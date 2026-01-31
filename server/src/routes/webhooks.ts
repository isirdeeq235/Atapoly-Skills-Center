import { Router, Response, Request } from "express";
import crypto from "crypto";

const router = Router();

// Paystack webhook
router.post("/paystack", async (req: Request, res: Response) => {
  const raw = Buffer.isBuffer(req.body) ? (req.body as Buffer) : undefined;
  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.warn("PAYSTACK_SECRET_KEY not configured; rejecting webhook");
    return res.status(400).send("missing secret");
  }

  if (!signature || !raw) return res.status(400).send("invalid payload");

  const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (hash !== signature) return res.status(401).send("invalid signature");

  try {
    const body = JSON.parse(raw.toString());
    console.log("paystack webhook:", body.event, body.data?.reference || body.data?.id);
    // Attempt to notify internal verify endpoint (admin protected)
    try {
      const reference = body.data?.reference || body.data?.id;
      if (reference) {
        await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": process.env.ADMIN_API_KEY || "" },
          body: JSON.stringify({ reference, provider: "paystack" }),
        });
      }
    } catch (e) {
      console.error("Error triggering internal verify", e);
    }
    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(400).send("bad request");
  }
});

// Flutterwave webhook (verif-hash header)
router.post("/flutterwave", async (req: Request, res: Response) => {
  const raw = Buffer.isBuffer(req.body) ? (req.body as Buffer) : undefined;
  const signature = req.headers["verif-hash"] as string | undefined;
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!secret) {
    console.warn("FLUTTERWAVE_SECRET_KEY not configured; rejecting webhook");
    return res.status(400).send("missing secret");
  }

  if (!signature || !raw) return res.status(400).send("invalid payload");

  const hash = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (hash !== signature) return res.status(401).send("invalid signature");

  try {
    const body = JSON.parse(raw.toString());
    console.log("flutterwave webhook:", body.event || body.type, body.data?.tx_ref || body.data?.id);
    try {
      const reference = body.data?.tx_ref || body.data?.id;
      if (reference) {
        await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": process.env.ADMIN_API_KEY || "" },
          body: JSON.stringify({ reference, provider: "flutterwave" }),
        });
      }
    } catch (e) {
      console.error("Error triggering internal verify", e);
    }
    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(400).send("bad request");
  }
});

export default router;
