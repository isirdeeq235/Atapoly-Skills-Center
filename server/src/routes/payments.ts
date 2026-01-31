import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.post("/initialize", async (req: Request, res: Response) => {
  try {
    const { provider, amount, email, payment_type, application_id, trainee_id, callback_url } = req.body as { provider: "paystack" | "flutterwave"; amount: number; email: string; payment_type: string; application_id: string; trainee_id: string; callback_url: string };

    if (!provider || !amount || !email || !payment_type || !application_id || !trainee_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payment = await prisma.payment.create({ data: { application_id, trainee_id, provider, payment_type, status: "pending", updated_at: new Date() } });

    const reference = `PAY-${payment.id}-${Date.now()}`;

    if (provider === "paystack") {
      const key = process.env.PAYSTACK_SECRET_KEY;
      if (!key) throw new Error("Paystack not configured");
      const r = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          reference,
          callback_url,
          metadata: { payment_id: payment.id, payment_type, application_id, trainee_id, trainee_email: email, callback_url },
        }),
      });
      const data = await r.json();
      if (!data.status) throw new Error(data.message || "Paystack initialization failed");
      const paystackReference = data.data.reference;
      await prisma.payment.update({ where: { id: payment.id }, data: { provider_reference: paystackReference } });
      return res.json({ success: true, authorization_url: data.data.authorization_url, reference: paystackReference, payment_id: payment.id });
    } else if (provider === "flutterwave") {
      const key = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!key) throw new Error("Flutterwave not configured");
      const r = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_ref: reference,
          amount,
          currency: "NGN",
          redirect_url: callback_url,
          customer: { email },
          meta: { payment_id: payment.id, payment_type, application_id, trainee_id, trainee_email: email, callback_url },
          customizations: { title: "Training Program Payment", description: payment_type === "application_fee" ? "Application Fee" : "Registration Fee" },
        }),
      });
      const data = await r.json();
      if (data.status !== "success") throw new Error(data.message || "Flutterwave initialization failed");
      await prisma.payment.update({ where: { id: payment.id }, data: { provider_reference: reference } });
      return res.json({ success: true, authorization_url: data.data.link, reference, payment_id: payment.id });
    }

    throw new Error("Invalid payment provider");
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reference, provider, payment_id } = req.body as { reference?: string; provider?: "paystack" | "flutterwave"; payment_id?: string };
    if (!reference && !payment_id) return res.status(400).json({ error: "reference or payment_id required" });

    // Find existing payment
    let payment = null as any;
    if (payment_id) payment = await prisma.payment.findUnique({ where: { id: payment_id } });
    else if (reference) payment = await prisma.payment.findFirst({ where: { provider_reference: reference } });

    if (payment?.status === "completed") return res.json({ success: true, status: "completed", already_processed: true, payment });

    const paymentProvider = provider || payment?.provider;
    const paymentReference = reference || payment?.provider_reference;
    if (!paymentReference) return res.status(200).json({ error: "No payment reference found. Payment may still be processing.", status: "pending" });
    if (!paymentProvider) return res.status(400).json({ error: "Payment provider not found" });

    let verificationResult: { success: boolean; data?: any; error?: string } = { success: false };

    if (paymentProvider === "paystack") {
      const key = process.env.PAYSTACK_SECRET_KEY;
      if (!key) throw new Error("Paystack not configured");
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`, { headers: { Authorization: `Bearer ${key}` } });
      const data = await r.json();
      if (data.status && data.data.status === "success") verificationResult = { success: true, data: data.data };
      else verificationResult = { success: false, error: data.message || "Payment not successful" };
    } else if (paymentProvider === "flutterwave") {
      const key = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!key) throw new Error("Flutterwave not configured");
      const r = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(paymentReference)}`, { headers: { Authorization: `Bearer ${key}` } });
      const data = await r.json();
      if (data.status === "success" && data.data.status === "successful") verificationResult = { success: true, data: data.data };
      else verificationResult = { success: false, error: data.message || "Payment not successful" };
    }

    if (!verificationResult.success) return res.json({ success: false, status: "failed", error: verificationResult.error });

    const paymentData = verificationResult.data;
    const metadata = (paymentProvider === "paystack" ? paymentData.metadata : paymentData.meta) || {};
    const resolvedPaymentId = metadata?.payment_id || payment_id || payment?.id;
    if (!resolvedPaymentId) throw new Error("Payment ID not found");

    // Update payment
    await prisma.payment.update({ where: { id: resolvedPaymentId }, data: { status: "completed", provider_reference: paymentReference, metadata: paymentData, updated_at: new Date() } });

    // Fetch full payment
    let fullPayment = await prisma.payment.findUnique({ where: { id: resolvedPaymentId } });

    const applicationId = metadata?.application_id || fullPayment?.application_id;
    const traineeId = metadata?.trainee_id || fullPayment?.trainee_id;
    const paymentType = metadata?.payment_type || fullPayment?.payment_type;

    if (paymentType === "application_fee") {
      await prisma.application.update({ where: { id: applicationId }, data: { application_fee_paid: true, updated_at: new Date() } });
      // create notification
      await prisma.notification.create({ data: { user_id: traineeId, type: "payment_success", title: "Application Fee Paid ✓", message: "Your application fee has been received.", metadata: { payment_id: metadata?.payment_id || payment_id, application_id: applicationId } } as any });
    } else if (paymentType === "registration_fee") {
      // generate registration number
      const registrationNumber = `R-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      await prisma.application.update({ where: { id: applicationId }, data: { registration_fee_paid: true, registration_number: registrationNumber, updated_at: new Date() } });
      // increment enrolled count on program if column exists
      let app: any = null;
      try {
        app = await prisma.application.findUnique({ where: { id: applicationId }, include: { programs: true } as any });
        if (app?.program_id) {
          await prisma.program.update({ where: { id: app.program_id }, data: { enrolled_count: { increment: 1 } as any } as any });
        }
      } catch (e) {
        // ignore if not available
      }
      await prisma.notification.create({ data: { user_id: traineeId, type: "registration_complete", title: "Registration Complete! 🎓", message: `Congratulations! You are now enrolled. Your registration number is ${registrationNumber}.`, metadata: { payment_id: metadata?.payment_id || payment_id, application_id: applicationId, registration_number: registrationNumber } as any } as any });

      // send registration email via local endpoint (best-effort)
      try {
        const recipients = await prisma.profile.findUnique({ where: { id: traineeId } });
        if (recipients?.email) {
          await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: recipients.email, template: "registration_complete", data: { name: recipients.full_name || "Trainee", program: app?.programs?.title || "Program", registration_number: registrationNumber } }),
          });
        }
      } catch (e) {
        console.error("Error sending registration email", e);
      }
    }

    // create receipt
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await prisma.receipt.create({ data: { payment_id: metadata?.payment_id || payment_id, trainee_id: traineeId, receipt_number: receiptNumber } as any });

    // attempt to send receipt email
    try {
      const traineeProfile = await prisma.profile.findUnique({ where: { id: traineeId } });
      if (traineeProfile?.email) {
        await fetch(`${process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: traineeProfile.email, template: "payment_receipt", data: { name: traineeProfile.full_name || "Trainee", payment_type: paymentType || "Payment", amount: paymentProvider === "paystack" ? (paymentData.amount / 100) : paymentData.amount, reference: reference || "N/A", receipt_number: receiptNumber } }),
        });
      }
    } catch (e) {
      console.error("Error sending receipt email", e);
    }

    res.json({ success: true, status: "completed", payment_type: paymentType, receipt_number: receiptNumber });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;