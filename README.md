# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Server: S3 uploads & migration 🚚

If you want to move from Supabase Storage to AWS S3, the server includes a helper and a migration script.

1. Configure env vars in `server/.env` (see `.env.example`):
   - `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET` (for migration)

2. Install server deps and run the script:

```sh
cd server
npm install
npm run migrate:supabase-to-s3
```

The script will download objects from Supabase Storage and upload them to the configured S3 bucket; results are saved under `server/tmp_migration/migration_results.json`.

Note: The migration script only copies files and logs a results file — updating DB records to point to the new S3 URLs must be done separately according to your app's data model.

---

## Webhooks (Paystack / Flutterwave) 🔔

The server exposes webhook endpoints at:

- `POST /api/webhooks/paystack`  (expects `x-paystack-signature` header)
- `POST /api/webhooks/flutterwave` (expects `verif-hash` header)

Both endpoints validate provider signatures and will call the internal `/api/payments/verify` endpoint (server-side) to process payments idempotently. Ensure `PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY`, and `ADMIN_API_KEY` are set in production and that your provider webhook URL points to these endpoints.

Security tips:
- Use HTTPS and restrict the endpoint on your provider to only your server IPs if possible.
- Use an `ADMIN_API_KEY` for internal verification calls and rotate it periodically.
- Add monitoring/alerting for failed webhook deliveries.

### Tests

The server includes a small test suite (Vitest + Supertest) covering webhook signature validation. Run tests from the `server` folder:

```sh
cd server
npm test
```

