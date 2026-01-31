import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import app from "../src/index";
import crypto from "crypto";

describe("Webhooks", () => {
  const PAYSTACK_SECRET = "test_paystack_secret";
  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects missing signature", async () => {
    const body = { event: "charge.success", data: { reference: "ref1" } };
    const res = await request(app).post("/api/webhooks/paystack").set("Content-Type", "application/json").send(JSON.stringify(body));
    expect(res.status).toBe(400);
  });

  it("accepts valid signature and triggers internal verify", async () => {
    const body = { event: "charge.success", data: { reference: "ref123" } };
    const raw = Buffer.from(JSON.stringify(body));
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(raw).digest("hex");

    const fetchSpy = vi.spyOn(global as any, "fetch").mockResolvedValue({ ok: true } as any);

    const res = await request(app)
      .post("/api/webhooks/paystack")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", hash)
      .send(raw);

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalled();
    const calledWith = fetchSpy.mock.calls[0][0] as string;
    expect(calledWith).toContain("/api/payments/verify");
  });
});
