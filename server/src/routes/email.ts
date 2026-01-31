import { Router } from "express";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";

const router = Router();

router.post("/send", async (req, res) => {
  try {
    const { to, subject, html, text, template, data } = req.body;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      return res.status(500).json({ error: "SMTP not configured" });
    }

    let finalSubject = subject;
    let finalHtml = html;

    if (template && data) {
      // Try DB template
      const dbTemplate = await prisma.emailTemplates.findFirst({ where: { template_key: template as string, is_enabled: true } });
      if (dbTemplate) {
        finalSubject = replacePlaceholders(dbTemplate.subject_template, data as Record<string, string>);
        finalHtml = replacePlaceholders(dbTemplate.html_template, data as Record<string, string>);
      } else {
        // Minimal fallback: if no template in DB, use simple subject/html
        finalSubject = finalSubject || `Notification - ${template}`;
        finalHtml = finalHtml || `<p>${JSON.stringify(data)}</p>`;
      }
    }

    if (!to || !finalSubject || !finalHtml) return res.status(400).json({ error: "Missing fields: to, subject/template" });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({ from: fromEmail, to, subject: finalSubject, html: finalHtml, text: text || undefined });

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function replacePlaceholders(template: string, data: Record<string, string>) {
  let result = template;
  data.year = new Date().getFullYear().toString();
  Object.entries(data).forEach(([k, v]) => {
    const regex = new RegExp(`\\{\\{${k}\\}\\}`, "g");
    result = result.replace(regex, v || "");
  });
  return result;
}

export default router;