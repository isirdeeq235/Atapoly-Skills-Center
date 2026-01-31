import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";
import emailRouter from "./routes/email";
import uploadsRouter from "./routes/uploads";
import paymentsRouter from "./routes/payments";
import systemRouter from "./routes/system";
import functionsPublicRouter from "./routes/functionsPublic";

dotenv.config();

// Lightweight env health check: warn about missing critical envs but do not exit.
const required = [
  { key: 'DATABASE_URL', reason: 'Database (Postgres) connection. Required for most data.' },
  { key: 'JWT_SECRET', reason: 'Auth token signing.' },
  { key: 'ADMIN_API_KEY', reason: 'Internal admin-protected endpoints.' },
];
const missing = required.filter(r => !process.env[r.key]);
if (missing.length) {
  console.warn('\n⚠️  Missing important environment variables. The server will start in degraded mode.');
  missing.forEach(m => console.warn(` - ${m.key}: ${m.reason}`));
  console.warn('You can run `npm run env:setup` to create a .env interactively or set the variables before starting the server.\n');
}

const app = express();
// Trust proxy headers only from loopback (localhost) to avoid allowing client-supplied X-Forwarded-For values
app.set('trust proxy', 'loopback');
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(morgan("dev"));
// Webhooks need raw body for signature verification; mount BEFORE body parsers
import webhooksRouter from "./routes/webhooks";
app.use("/api/webhooks", express.raw({ type: "*/*" }), webhooksRouter);

app.use(express.json());

// Serve uploaded files in development
app.use('/uploads', express.static('uploads'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/email", emailRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/payments", paymentsRouter);

app.use("/api/system", systemRouter);
app.use("/api/functions", functionsPublicRouter);
import profileRouter from "./routes/profile";
app.use("/api/profile", profileRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;