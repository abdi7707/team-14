# SENED AI

SENED AI helps small and medium business owners in Ethiopia keep their business information in one Business Passport, see their preparation readiness and potential financing matches at Ethiopian banks and microfinance institutions, and generate professional draft documents with AI in English, Amharic, and Afaan Oromoo. SENED is not a bank: it never promises financing, and owners apply through each institution's own channel.

Built by Team 14 at the Cursor AI Hackathon. Planning documents: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [SENED_task.md](SENED_task.md), [SENED_team_assignments_7hr.md](SENED_team_assignments_7hr.md), [SENED_git-workflow.md](SENED_git-workflow.md).

## Run the API locally

Requires Node.js 20.12 or newer and pnpm. The API lives in `artifacts/api-server`.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env` in the repository root and set `SESSION_SECRET` (at least 32 characters; the API refuses to boot without it):

   ```bash
   cp .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Set `GEMINI_API_KEY` in `.env` to a key from [Google AI Studio](https://aistudio.google.com/apikey). Set `DATABASE_URL` to a PostgreSQL connection string (a free hosted database such as Neon or Supabase works), then create the tables. The command is safe to run again; it only applies differences.

   ```bash
   pnpm db:push
   ```

4. Start the API on port 3000 (or `PORT`):

   ```bash
   pnpm dev:api
   ```

5. Open <http://localhost:3000/api/healthz>. It should return `{"status":"ok"}`.

Run `pnpm run typecheck` before opening a pull request. The API contract is in [docs/api-contracts.md](docs/api-contracts.md).

## Deploy the API

The API is one Node.js process and runs on any host that supports Node.js 20.12+ and pnpm, such as Render, Railway or Fly.io. Production runs a single bundled file, `artifacts/api-server/dist/index.mjs`, built with esbuild.

1. Create a PostgreSQL database (Neon and Supabase have free tiers) and create the tables once from your laptop. Put the production `DATABASE_URL` in your shell for this command only, never in a committed file:

   ```bash
   DATABASE_URL="postgres://..." pnpm db:push
   ```

   In PowerShell, clear the variable afterwards so later commands in the same terminal don't use the production database:

   ```powershell
   $env:DATABASE_URL = "postgres://..."; pnpm db:push; Remove-Item Env:DATABASE_URL
   ```

2. Create a web service from this repository with these settings:

   - **Build command:**

     ```bash
     npx --yes pnpm@12.21.0 install --frozen-lockfile --filter "@workspace/api-server..." && npx --yes pnpm@12.21.0 --filter @workspace/api-server run build
     ```

     This uses the pnpm version from the `packageManager` field whatever the host has installed, and installs only the API and the workspace packages it uses, not the mobile app.

   - **Start command:** `node --enable-source-maps artifacts/api-server/dist/index.mjs` (what `pnpm start:api` runs, without needing pnpm at runtime)
   - **Health check path:** `/api/healthz`
   - **Environment variables:** `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY` and `TRUST_PROXY_HOPS`, and optionally `ADMIN_EMAILS`, `GEMINI_MODEL` and `LOG_LEVEL`. The host sets `PORT`.

   On Render, also set `NODE_VERSION=24.15.0`, `SKIP_INSTALL_DEPS=true` (otherwise Render runs its own install before the build command) and `TRUST_PROXY_HOPS=3`.

3. Open `https://<your-domain>/api/healthz` and check that it returns `{"status":"ok"}`.

4. Point the mobile app at the API by setting `EXPO_PUBLIC_DOMAIN=https://<your-domain>`. Include `https://`: without a protocol the app falls back to plain `http://`.
