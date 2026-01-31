import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock prisma so tests don't require a running database
vi.mock("./lib/prisma", () => ({
  default: {
    payment: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    application: { update: vi.fn(), findUnique: vi.fn() },
    profile: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
    receipt: { create: vi.fn() },
    program: { update: vi.fn() },
  },
}));

import app from "./index";
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
    const rawStr = JSON.stringify(body);
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawStr).digest("hex");

    const fetchSpy = vi.spyOn(global as any, "fetch").mockResolvedValue({ ok: true } as any);

    const res = await request(app)
      .post("/api/webhooks/paystack")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", hash)
      .send(rawStr);

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalled();
    const calledWith = fetchSpy.mock.calls[0][0] as string;
    expect(calledWith).toContain("/api/payments/verify");
  });
});
