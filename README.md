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

3. Set `DATABASE_URL` in `.env` to a PostgreSQL connection string (a free hosted database such as Neon or Supabase works), then create the tables. The command is safe to run again; it only applies differences.

   ```bash
   pnpm db:push
   ```

4. Start the API on port 3000 (or `PORT`):

   ```bash
   pnpm dev:api
   ```

5. Open <http://localhost:3000/api/healthz>. It should return `{"status":"ok"}`.

Run `pnpm run typecheck` before opening a pull request.
