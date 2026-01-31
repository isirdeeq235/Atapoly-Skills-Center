# Atapoly Server (TypeScript + Express + Prisma) 🚀

Quick start (local):

1. Copy env example and update:
   cp .env.example .env

2. Start Postgres + server (docker):
   docker compose up --build

3. Run Prisma migrations (in container or locally):
   npx prisma migrate dev --name init
   npx prisma db seed

API endpoints added (examples):
- POST /api/auth/register
- POST /api/auth/login
- POST /api/email/send — send emails (template or raw html)
- POST /api/payments/verify — verify payment with provider (protected by ADMIN_API_KEY header `x-admin-key`)
- POST /api/uploads — upload files (multipart form `file`)
- GET  /api/system/check-connections — checks DB, SMTP, payment provider keys, storage

Development notes:
- The server will start in a degraded mode if critical envs are missing and will log helpful warnings. Use `npm run env:setup` to interactively create a `.env` file from `.env.example`.
- Set `ADMIN_API_KEY`, SMTP creds, payment provider keys, and `DATABASE_URL` in your `.env` when you're ready to enable full functionality.
- Install new dependencies in the `server/` folder: `npm install` (adds nodemailer, multer, aws-sdk helpers).
- For local uploads, uploaded files will be served at `/uploads/<filename>`; if you configure S3, use `/api/uploads/presign` or `/api/uploads/s3` for production uploads.

4. Server will be available at http://localhost:4000

Useful scripts:
- npm run dev (local with ts-node-dev)
- npm run build && npm start (build + run)
- npm run prisma:generate
- npm run prisma:migrate

Notes:
- Change `JWT_SECRET` in production and use a managed Postgres instance.
- There's a seed user: `admin@example.com` / `password` (change it).
