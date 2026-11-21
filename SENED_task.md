# TEAM 14 — SENED AI
## Task Management & Implementation Plan

**Project:** SENED AI — AI-powered business document and financing preparation platform for Ethiopian businesses  
**Hackathon:** Cursor AI Hackathon — 7 hours  
**Team:** Team 14 — Abdulkarim, Yasmin (developers) · Abdisa, Filimon (research & pitch)  
**Repository:** `github.com/abdi7707/team-14`  
**Version:** 1.0  
**Status:** Active Engineering Plan

Companion documents: `SYSTEM_DESIGN.md` (full architecture), `SENED_team_assignments_7hr.md` (who does what), `SENED_git-workflow.md` (branching, review, and merge process).

---

## 1. Purpose

This is the master implementation checklist for building SENED AI during the hackathon.

SENED AI helps small and medium business owners in Ethiopia keep their business information in one **Business Passport**, see honestly how prepared they are for financing from Ethiopian banks and microfinance institutions, and generate professional, trilingual documents (English, Amharic, Afaan Oromoo) with AI.

**Not:** a bank, a loan-approval system, an automatic loan-submission service, or an accounting tool.

### Core engineering principle

> The Business Passport stores what is known → Engines compute readiness and potential matches → AI drafts documents only from passport data → The server guards accounts, credits, and money → The user always submits to the bank through the bank's own channel.

### Hackathon scope rule

`SYSTEM_DESIGN.md` describes the complete product. In 7 hours we build **one convincing vertical slice** of it (section 24) and explicitly leave the rest for after the hackathon (section 25). When in doubt, cut scope, not quality.

## 2. Status & Priority

- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed
- `[!]` Blocked
- `[?]` Needs decision

Priority: **P0** must work in the demo; **P1** build only after the related P0 works; **P2** only if far ahead of schedule; **P3** after the hackathon (from the roadmap in `SYSTEM_DESIGN.md` §14.2).

## 3. Hackathon Clock

All times are hours from the official start. Write your real start time here so everyone can convert: **0:00 = ____**.

| Clock | Block | Gate at the end |
|---|---|---|
| 0:00–0:30 | Kickoff & foundation | **Gate 1** — Scope & contracts locked |
| 0:30–2:30 | Build I — vertical slice | **Gate 2** — Vertical slice works |
| 2:30–4:15 | Build II — MVP features | **Gate 3** — Feature complete |
| 4:15–5:15 | Integration & deployment | **Gate 4** — Integrated & deployed |
| 5:15–6:00 | Fix & polish | **Code freeze at 6:00** (tag `v1.0.0`) |
| 6:00–7:00 | Rehearsal, backup video, submission | **Gate 5** — Submitted by 6:45 |

**Cut rule:** anything that is not working at its gate is cut or moved to P3. No exceptions.

---

# 4. Phase 0 — Project Foundation (0:00–0:30)

- [ ] **P0** Read the Cursor AI Hackathon rules: deadline, submission items (repo link, video, deck, form), and judging criteria.
- [ ] **P0** Add all four teammates as collaborators on `abdi7707/team-14`.
- [ ] **P0** First commit: `SYSTEM_DESIGN.md`, `SENED_task.md`, `SENED_team_assignments_7hr.md`, `SENED_git-workflow.md`. Keep the VoiceSOS reference files out of the repository; they belong to another team.
- [ ] **P0** Add `README.md` (one-paragraph pitch + how to run), `.gitignore`, `.env.example`.
- [ ] **P0** Create the pnpm workspace: `pnpm-workspace.yaml`, `tsconfig.base.json`, root `package.json` with a `typecheck` script.
- [ ] **P0** Initialize the Expo app in `artifacts/sened-mobile` (Expo 54, React Native 0.81, expo-router 6, TypeScript).
- [ ] **P0** Initialize the Express 5 API in `artifacts/api-server` with `GET /api/healthz`.
- [ ] **P0** Create `lib/db` (Drizzle) and `lib/api-zod` (shared Zod schemas).
- [ ] **P0** Provision a hosted PostgreSQL database and a Gemini API key. Share secrets privately, never in Git.
- [ ] **P1** Add `.cursor/rules/sened.mdc` with project conventions (stack, folder ownership, potential-match wording, no secrets) so every Cursor agent follows the same rules.
- [ ] **P1** Add `.env` to `.cursorignore` so AI tools do not read secrets.
- [ ] **P2** Linting and formatting (only if the scaffold already provides it).
- [ ] **P3** `CONTRIBUTING.md`, `LICENSE`.

Hackathon repository structure (a subset of `SYSTEM_DESIGN.md` §5, so it can grow into the full design later):

```text
team-14/
├── artifacts/
│   ├── sened-mobile/        # Expo app (Yasmin)
│   │   ├── app/             # expo-router screens
│   │   ├── components/      # Button, Card, Input, Badge, ProgressBar...
│   │   ├── context/         # Auth, Business, Financing, Documents, I18n
│   │   ├── lib/             # engines, registries, i18n, API client
│   │   └── types/           # domain types (BusinessPassport, Institution...)
│   └── api-server/          # Express API (Abdulkarim)
│       └── src/{routes,lib,middlewares}
├── lib/
│   ├── db/                  # Drizzle schema + connection (Abdulkarim)
│   └── api-zod/             # Shared request/response schemas (both developers)
├── docs/
│   ├── api-contracts.md
│   └── pitch/               # Deck PDF, screenshots (Abdisa, Filimon)
├── .env.example
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
├── CHANGELOG.md
├── SYSTEM_DESIGN.md
├── SENED_task.md
├── SENED_team_assignments_7hr.md
└── SENED_git-workflow.md
```

Deferred from the full design: `lib/api-spec` (OpenAPI) and `lib/api-client-react` (Orval codegen) are P3. Hand-written Zod schemas in `lib/api-zod` are the contract for the hackathon.

> **pnpm + Expo tip:** if Metro cannot resolve packages inside the workspace, add `node-linker=hoisted` to `.npmrc` and reinstall.

# 5. Phase 1 — Research & Product Definition (0:00–3:00, pitch team)

## Problem validation

- [ ] **P0** Document the problem: Ethiopian SME owners are rejected or never apply because of incomplete paperwork, unclear lender requirements, and no professional documents (`SYSTEM_DESIGN.md` §1.2).
- [ ] **P0** Find 2–3 credible data points on the SME financing gap in Ethiopia, with sources.
- [ ] **P1** Define the target user (for example, a small shop or coffee-processing business owner outside Addis Ababa).
- [ ] **P1** Document why mobile-first and trilingual (EN, AM, OM) matter.

## Competitive research

- [ ] **P1** List existing alternatives: loan officers, paid consultants who write business plans, generic AI chat tools, bank apps.
- [ ] **P1** Explain what SENED does differently: one Business Passport reused for every document and lender.
- [ ] **P1** Record what SENED explicitly does not do: approve loans, submit applications, or replace accounting.

## Lender requirements research (feeds the app)

- [ ] **P0** For at least 3 institutions (target all 6: CBE, DBE, Dashen, Awash, CoopOro, ACSI): one or two SME loan products, typical amount range, key requirements, and a source link.
- [ ] **P0** Tag every requirement as `MANUAL_RESEARCH` with `MEDIUM` reliability. Nothing is presented as officially verified.
- [ ] **P0** Hand the table to Yasmin by **3:00**. She uses clearly labeled sample data until then.

## Research questions

- [ ] Why SME loan applications fail in Ethiopia.
- [ ] Which documents Ethiopian lenders typically request.
- [ ] Telebirr adoption for small digital payments.
- [ ] Language preferences of SME owners (English, Amharic, Afaan Oromoo).
- [ ] Willingness to pay for prepared documents (149 / 699 / 1,499 ETB price points).

# 6. Phase 2 — Product & UX

## Core demo journey

```text
Business owner registers
      ↓
Creates a business (basics + financing goal)
      ↓
Fills the Business Passport (MVP sections)
      ↓
Sees passport completeness + next best action
      ↓
Sees potential financing matches + preparation readiness
      ↓
Generates an AI Loan Request Letter in their language
      ↓
Previews it and downloads the PDF
      ↓
(P1) Buys credits via Telebirr → admin approves → credits appear
```

- [ ] **P0** Auth screens: welcome, login, register.
- [ ] **P0** Onboarding: business basics, financing goal.
- [ ] **P0** Home tab with passport completeness and next best action.
- [ ] **P0** Passport section forms (MVP sections, §7).
- [ ] **P0** Financing matches list and product detail.
- [ ] **P0** Document flow: choose type → choose language → generate → view → PDF.
- [ ] **P1** Language switcher (EN / AM / OM).
- [ ] **P1** Store: products, checkout with Telebirr transaction ID, my payments, my credits.
- [ ] **P1** Admin: pending payments, approve, reject.
- [ ] **P1** Loading, empty, and error states on every P0 screen.
- [ ] **P2** Visual polish (gradients, haptics, animations).

UI kit (subset of `SYSTEM_DESIGN.md` §6.4): `Button`, `Card`, `Input`, `Badge`, `ProgressBar`, `EmptyState`, `ScreenHeader`, with colors in `constants/colors.ts`.

# 7. Phase 3 — Business Passport (single source of truth)

The full design has 12 sections. The hackathon MVP uses these:

| Section | Priority | Key fields |
|---|---|---|
| Identity | P0 | Business name, sector, business type, year started |
| Location | P0 | Region, city / sub-city |
| Legal | P0 | TIN, trade license number, license expiry |
| Operations | P0 | Products/services, number of employees |
| Financial | P0 | Monthly revenue, monthly expenses, assets |
| Financing | P0 | Amount needed, purpose, preferred term, collateral |
| Contact, Ownership, Banking | P1 | Phone, owners, bank and years banking |
| Employees, Evidence, Versions | P3 | — |

- [ ] **P0** Define the `BusinessPassport` type for the MVP sections. Money fields use `StructuredAmount` `{ value, currency, period, sourceType, confidence, verified, updatedAt }`.
- [ ] **P0** `BusinessProvider` persists to AsyncStorage at `@sened:businesses:<userId>` and `@sened:active_business:<userId>`.
- [ ] **P0** `lib/passport.ts`: per-section completeness, overall completeness, next best action.
- [ ] **P1** Workflow readiness per document (for example, "Loan Request Letter: ready").
- [ ] **P2** Business health snapshot.
- [ ] **P3** Legacy flat `profile` and `migrateBusiness()` (not needed: there is no older data in a fresh build).

## Passport tests

- [ ] Empty passport shows 0% and a sensible next best action.
- [ ] Completing a section increases completeness.
- [ ] Data persists after an app reload.
- [ ] Data is scoped per user (log out, log in as someone else, see nothing).

# 8. Phase 4 — Financing Intelligence (on-device)

Wording here is trust-critical.

- [ ] **P0** Institution registry with products and requirements. Start with 3 institutions, target all 6. Each requirement carries `source` and `reliability`.
- [ ] **P0** `runMatchingEngine(passport, registry)` returns potential matches.
- [ ] **P0** `calculateFitScore` (sector, amount range, business age, region).
- [ ] **P0** `checkRequirements` returns met and missing requirements.
- [ ] **P0** `calculateReadiness` returns preparation readiness as a percentage.
- [ ] **P0** Wording rule in every string: "potential match" and "preparation readiness". Never "approved", "eligible", or "guaranteed".
- [ ] **P1** Missing-requirement checklist that links to the right passport section.
- [ ] **P1** Visible note: "Based on manual research. Confirm with the institution."

## Financing tests

- [ ] A business outside a product's amount range is not shown as a strong match.
- [ ] A missing TIN or license lowers readiness and appears in the missing list.
- [ ] A codebase search finds no UI text saying "approved" or "guaranteed".

# 9. Phase 5 — AI Document Generation (server)

The AI is a writer, not a source of facts. The Business Passport is the source of facts.

### AI may

- Turn passport data into professional prose.
- Write in English, Amharic, or Afaan Oromoo.
- Follow the outline defined for each document type.

### AI must not

- Invent figures, licenses, or facts that are not in the passport (use "[to be confirmed]" instead).
- Promise or imply loan approval.
- Present the draft as an official or certified document.

Tasks:

- [ ] **P0** Gemini client (`@google/genai`, model `gemini-flash-latest`) using `GEMINI_API_KEY` from the environment.
- [ ] **P0** `docGeneration.ts` spec (title + outline) for the **Loan Request Letter**.
- [ ] **P0** Prompt = document spec + passport data from the client + language block from `docLanguage.ts`.
- [ ] **P0** Expect structured output `{ title, sections: [{ heading, body }] }`, validate it with Zod, and reject malformed output.
- [ ] **P0** Save a `generated_documents` row: `GENERATING` → `READY` or `FAILED`.
- [ ] **P0** Append the trilingual disclaimer: the document is a draft, not an official document.
- [ ] **P1** Second document type: **Business Plan**.
- [ ] **P1** Timeout with one retry and a clear user-facing error.
- [ ] **P1** Credit-safe generation once payments exist (§10).
- [ ] **P2** Typed signature (`POST /api/documents/:id/sign`).

# 10. Phase 6 — Payments, Credits & Admin Approval (P1)

Trust-critical: this is money. Start only after Gate 2 has passed.

```text
User pays with Telebirr outside the app
      ↓
Submits transaction ID → payment PENDING
      ↓
Admin reviews → APPROVED (or REJECTED with reason)
      ↓
Server creates entitlement (credits)
      ↓
Generation consumes 1 credit atomically
```

- [ ] **P1** Idempotent startup bootstrap: upsert products (Loan Request Letter 149 ETB, Business Plan 699 ETB, Loan Ready Package 1,499 ETB with 4 credits) and promote `ADMIN_EMAILS` to admin.
- [ ] **P1** `GET /api/products`.
- [ ] **P1** `POST /api/payments` with product and transaction ID, status `PENDING`.
- [ ] **P1** `GET /api/payments/mine`, `GET /api/entitlements/mine`.
- [ ] **P1** Admin list, approve, reject. Approval runs in one transaction and inserts the entitlement (`entitlements.payment_id` is unique).
- [ ] **P1** Generation reserves a credit with a guarded `UPDATE ... SET usage_used = usage_used + 1 WHERE usage_used < usage_limit` in the same transaction as the `GENERATING` row. Refund only on the guarded `GENERATING → FAILED` transition.
- [ ] **P2** Auto-refund `GENERATING` rows older than 10 minutes.
- [ ] **P2** Payment screenshot upload (presigned URL to object storage).
- [ ] **P2** Audit log events: `payment_submitted`, `payment_approved`, `entitlement_granted`, `document_generated`.

**Rule:** until this phase lands, generation only requires login. The credit check is switched on in the same PR that adds payments.

## Credit-safety tests

- [ ] Approving the same payment twice creates only one entitlement.
- [ ] Reusing a transaction ID is rejected (unless the earlier payment was rejected).
- [ ] A user with 0 credits cannot generate.
- [ ] A failed generation refunds exactly one credit.
- [ ] No endpoint lets the client grant itself credits.

# 11. Phase 7 — Backend (API server)

- [ ] **P0** Express 5 foundation: JSON body parsing, CORS, pino-http logging, error handler, `GET /api/healthz`.
- [ ] **P0** Environment loading. The server refuses to boot without `SESSION_SECRET`.
- [ ] **P0** Auth: register, login, me. bcrypt (cost 10), JWT with 30-day lifetime, `requireAuth` loads the user and role from the database on every request.
- [ ] **P0** Documents: generate, mine, by id, PDF.
- [ ] **P1** Products, payments, entitlements, and admin routes.
- [ ] **P1** Rate limits: auth 30 per 15 minutes, payments 10 per minute, generation 6 per minute. Enable `trust proxy`.
- [ ] **P2** Storage routes and admin summary.

Hackathon endpoints (subset of `SYSTEM_DESIGN.md` §7.2):

```text
GET    /api/healthz                        P0
POST   /api/auth/register                  P0
POST   /api/auth/login                     P0
GET    /api/auth/me                        P0
POST   /api/documents/generate             P0
GET    /api/documents/mine                 P0
GET    /api/documents/:id                  P0
GET    /api/documents/:id/pdf              P0
GET    /api/products                       P1
POST   /api/payments                       P1
GET    /api/payments/mine                  P1
GET    /api/entitlements/mine              P1
GET    /api/admin/payments                 P1
POST   /api/admin/payments/:id/approve     P1
POST   /api/admin/payments/:id/reject      P1
POST   /api/documents/:id/sign             P2
POST   /api/storage/uploads/request-url    P2
GET    /api/admin/summary                  P2
```

- [ ] **P0** Agree on request, response, and error shapes in `lib/api-zod` before any frontend integration (by 0:30).

# 12. Phase 8 — Database

Tables from `SYSTEM_DESIGN.md` §8.1:

```text
users                 P0
generated_documents   P0
products              P1
payments              P1
entitlements          P1
audit_logs            P2
```

- [ ] **P0** Drizzle schema for `users` and `generated_documents`; push to the hosted database.
- [ ] **P1** `products`, `payments`, `entitlements` with constraints: unique `users.email`, unique `entitlements.payment_id`, and a partial unique index on `payments.transaction_id` where `status <> 'REJECTED'`.
- [ ] **P1** Apply the partial unique index with manual SQL (`drizzle-kit push` may not detect it). Re-apply it on any new database, including production.
- [ ] **P2** `audit_logs`.

Data split (keep from §8.3): accounts, payments, credits, and generated documents live in **PostgreSQL**. The Business Passport and financing data live **on the device**. `payments.business_id` is a client-side identifier.

# 13. Phase 9 — Offline-First Client State

Provider nesting (subset of §6.2):

```text
SafeAreaProvider
 └ ErrorBoundary
    └ I18nProvider
       └ AuthProvider
          └ BusinessProvider
             └ FinancingProvider
                └ DocumentProvider
                   └ StoreProvider (P1)
                      └ QueryClientProvider → <Stack/>
```

On-device storage keys:

```text
@sened:auth_token
@sened:user
@sened:businesses:<userId>
@sened:active_business:<userId>
@sened:docs:<userId>
@sened:fin_saved:<userId>
```

- [ ] **P0** `AuthProvider` stores the token, attaches `Authorization: Bearer <token>`, and clears it on logout.
- [ ] **P0** Passport and financing matches work with no network connection.
- [ ] **P1** Clear "you are offline" message on server-backed actions (generation, payments).
- [ ] **P3** SecureStore instead of AsyncStorage for tokens on native.

# 14. Phase 10 — Frontend Screens

## Business owner

- [ ] **P0** `(auth)` welcome, login, register.
- [ ] **P0** `(onboarding)` business basics, financing goal.
- [ ] **P0** `(tabs)` Home, Business, Documents, Financing, Profile.
- [ ] **P0** `(passport)` overview and MVP section screens.
- [ ] **P0** `(financing)` matches, institution, product.
- [ ] **P0** `(document)` select, flow (language → generate → preview → PDF).
- [ ] **P1** `(financing)` checklist.
- [ ] **P1** `(store)` catalog, checkout, my payments.

## Admin

- [ ] **P1** `(store)` admin: pending payments, approve, reject.

Out of the hackathon: `(evidence)`, `(submission)`, and the application command center screens.

# 15. Phase 11 — PDF Export

- [ ] **P0** `pdf.ts` renders documents with pdfkit and embeds Noto Sans and Noto Sans Ethiopic.
- [ ] **P0** `GET /api/documents/:id/pdf` is owner-only and includes the disclaimer.
- [ ] **P0** Amharic text renders as Ethiopic characters, not empty boxes. Test this early.
- [ ] **P0** The client downloads the PDF with `fetch` and the Bearer header (a plain link has no token). Native uses expo-sharing, loaded with a dynamic import so the web build does not break.
- [ ] **P2** Store rendered PDFs in object storage (`pdf_object_path`). On-demand rendering is enough for the demo.

# 16. Phase 12 — Multilingual Support

Languages: **English, Amharic (አማርኛ), Afaan Oromoo**.

- [ ] **P0** Document generation accepts `EN`, `AM`, or `OM` and writes in that language.
- [ ] **P0** Test one full flow in English, then generate and open an Amharic PDF.
- [ ] **P1** `I18nProvider` with catalogs as `[English, Amharic, Oromo]` tuples for the main screens, and a language switcher on Profile.
- [ ] **P1** Test Afaan Oromoo document generation.
- [ ] **P1** Terminology file for consistent business terms.
- [ ] **P2** Full UI coverage in all three languages.

Do not trade correctness for language count. A wrong Amharic financial term is worse than English. Ask a teammate who reads Amharic or Afaan Oromoo to review.

# 17. Phase 13 — Security

- [ ] **P0** Passwords hashed with bcrypt; never stored or logged in plain text.
- [ ] **P0** `SESSION_SECRET` required at boot; JWT signed with a 30-day lifetime.
- [ ] **P0** Role read from the database, never from the token alone. Admin routes check the role server-side.
- [ ] **P0** Ownership checks on `/api/documents/:id` and `/pdf`.
- [ ] **P0** Zod validation on every request body.
- [ ] **P0** Secrets only in `.env`; `.env` never committed; `.env.example` holds names only.
- [ ] **P0** Never paste secrets into AI chats or prompts.
- [ ] **P1** Entitlements are created only by admin approval on the server.
- [ ] **P1** Rate limits and `trust proxy`.
- [ ] **P2** Audit log; document contents are never logged.
- [ ] **P3** Known gaps from §10: restrict CORS origins, token refresh/revocation, password reset, SecureStore on native.

# 18. Phase 14 — Testing

Manual checklists are P0. Automated tests are P2, starting with the pure engines.

## Unit (P2)

- [ ] Passport completeness and next best action.
- [ ] Fit score, requirement check, readiness.
- [ ] AI output schema validation.
- [ ] Credit guard (approve twice, zero credits, refund once).

## Integration

- [ ] App → API: register, login, me.
- [ ] App → API: generate with passport data → view → PDF.
- [ ] API → database: users and documents persist.
- [ ] (P1) Payment → admin approval → credits → generation.

## End-to-end demo path

- [ ] Register a new account.
- [ ] Create a business and fill the MVP passport sections.
- [ ] Completeness and next best action update.
- [ ] Potential matches and readiness appear.
- [ ] Generate a Loan Request Letter in English.
- [ ] Generate it in Amharic and open the PDF.
- [ ] (P1) Buy credits, approve as admin, see credits increase.

## Failure tests

- [ ] Wrong password and invalid token.
- [ ] Gemini timeout or malformed output.
- [ ] No internet: passport and matches still work; generation shows a clear message.
- [ ] Amharic PDF rendering.
- [ ] Expo web does not crash on native-only modules.
- [ ] (P1) Duplicate transaction ID, double approval, zero credits.

# 19. Phase 15 — Observability

- [ ] **P1** pino-http request logs, controlled by `LOG_LEVEL`.
- [ ] **P1** Log AI generation duration and failures (document type, language, duration; never the content).
- [ ] **P2** `GET /api/admin/summary`.

Never log passwords, tokens, document contents, or passport financial data.

# 20. Phase 16 — Deployment

- [ ] **P0** Decide the demo setup at Gate 1: deployed API with an Expo web build, or a local API with Expo Go on a phone. Prepare the other one as a fallback.
- [ ] **P1** Deploy the API (container or PaaS such as Render or Railway; esbuild bundle with `pdfkit` and `fontkit` kept external).
- [ ] **P1** Production environment variables and database (run the schema push and the partial index SQL).
- [ ] **P1** Point `EXPO_PUBLIC_DOMAIN` at the deployed API.
- [ ] **P1** Production smoke test: healthz, register, generate, PDF.
- [ ] **P3** Expo EAS Android build, own object storage bucket.

# 21. Phase 17 — CI/CD

- [ ] **P2** GitHub Actions: `pnpm install` and `pnpm run typecheck` on pull requests.
- [ ] **P3** Automated tests in CI, deployment workflow, block merges on failing checks.

During the hackathon, run `pnpm run typecheck` locally before every pull request instead.

# 22. Phase 18 — Demo Engineering

Use one strong story, not a feature dump.

- [ ] Pick one persona (for example, a coffee-processing business in Jimma that needs a 500,000 ETB working-capital loan).
- [ ] Write a step-by-step demo script with timings.
- [ ] Prepare a demo account with a realistic pre-filled passport, plus a backup account.
- [ ] Show completeness rising as one passport section is completed live.
- [ ] Show potential matches and preparation readiness, with the potential-match wording.
- [ ] Generate the Loan Request Letter live (Amharic if stable) and open the PDF.
- [ ] (P1) Show the Telebirr purchase → admin approval → credits.
- [ ] (P1) Show the language switch.
- [ ] Keep a pre-generated document ready in case Gemini is slow.
- [ ] Test on the real demo device, browser, and network.
- [ ] Record a backup demo video right after code freeze.
- [ ] Prepare answers to likely judge questions: data accuracy, business model, privacy, what is next.

# 23. Phase 19 — Documentation

- [ ] `README.md`: pitch paragraph, screenshots, how to run (install, env, database push, start API, start Expo), demo account.
- [ ] `.env.example` with every variable name.
- [ ] `docs/api-contracts.md` pointing to the Zod schemas in `lib/api-zod`.
- [ ] `CHANGELOG.md` updated at every gate.
- [ ] Pitch deck PDF and screenshots in `docs/pitch/`.
- [ ] **P1** Deployment notes.
- [ ] **P2** Mark in `SYSTEM_DESIGN.md` which parts the hackathon MVP implements.

# 24. MVP Definition

The hackathon MVP requires all of these to work together:

- [ ] Register and log in (server auth with JWT).
- [ ] Create a business and fill the MVP Business Passport sections (saved on the device).
- [ ] Passport completeness and next best action.
- [ ] Potential financing matches with fit score and preparation readiness for at least 3 institutions.
- [ ] AI-generated Loan Request Letter built from passport data.
- [ ] Documents in at least English and Amharic.
- [ ] PDF download with correct Ethiopic rendering and the draft disclaimer.
- [ ] Potential-match wording everywhere; nothing implies approval.
- [ ] No secrets in the repository.
- [ ] A working demo environment (deployed, or local with a backup video).
- [ ] Pitch deck and demo script.

**Stretch (P1), in this order:** Telebirr payment with admin approval and credits → UI language switcher → Afaan Oromoo documents → Business Plan document → rate limits → public deployment.

# 25. Explicitly Out of the Hackathon MVP

Do not allow scope creep into:

- Evidence upload, classification, simulated extraction, and conflict resolution (§6.3.4).
- Application Command Center (§6.3.5).
- Submission and disbursement tracking (§6.3.6).
- The full 28-template document catalog (we build one or two AI documents).
- Real OCR and bank API integrations.
- Automated Telebirr verification or merchant API.
- Submitting applications to banks (SENED records, it never submits).
- Cloud sync of passport data.
- OpenAPI + Orval code generation.
- Push notifications, admin web dashboard, subscriptions, WhatsApp/Telegram bots.
- Password reset and refresh tokens.
- Accounting or bookkeeping.
- App store builds.

# 26. Definition of Done

A task is complete only when:

1. Code, design, or documentation is merged into `main` through a pull request.
2. `pnpm run typecheck` passes and the feature works in the demo environment.
3. The other developer can run or use it.
4. No secrets are committed.
5. Wording follows the potential-match rule.
6. Related documentation is updated (`README.md`, `.env.example`, contracts).
7. `CHANGELOG.md` is updated at the next gate.

# 27. Hourly Team Check-in

Every hour on the hour, all four people, 3 minutes maximum.

### Done
- What did I finish since the last check-in?

### Next
- What am I doing this hour?

### Blockers
- What is stopping me?

### Integration
- What does a teammate need from me (contract, data, screenshot, demo account)?

### Evidence
- Which PR, commit, slide, or source shows the work?

# 28. Priority Rule

```text
Trust rules (no approval promises, no secrets, no client-granted credits)
  ↓
Business Passport
  ↓
AI Loan Request Letter + PDF
  ↓
Financing matches & readiness
  ↓
Working demo environment
  ↓
Payments & credits
  ↓
Multilingual UI
  ↓
Polish
  ↓
Nice-to-have features
```

# 29. Decision Gates

## Gate 1 — Scope & contracts (0:30)
- [ ] Hackathon rules and submission requirements known.
- [ ] MVP scope (§24) and cut rule agreed.
- [ ] Shared contracts for auth and documents agreed in `lib/api-zod`.
- [ ] Repository scaffold pushed; secrets shared privately.
- [ ] Demo setup decided.

## Gate 2 — Vertical slice (2:30)
- [ ] Register and log in from the app.
- [ ] Passport (Identity, Financial, Financing at minimum) saves on the device.
- [ ] One AI Loan Request Letter generated from passport data and shown in the app.

## Gate 3 — Feature complete (4:15)
- [ ] Potential matches and readiness work.
- [ ] PDF with Ethiopic font works.
- [ ] Amharic document works.
- [ ] (P1) Payment → approval → credits works, or it is cut now.

## Gate 4 — Integrated & deployed (5:15)
- [ ] The app talks to the final API (deployed or local fallback).
- [ ] The full demo path works twice in a row.
- [ ] No mock data in the demo path.

## Gate 5 — Demo ready (6:45)
- [ ] Code freeze held since 6:00 (`v1.0.0` tagged).
- [ ] Backup video recorded.
- [ ] Deck final and README complete.
- [ ] Submission sent.

# 30. Final Product Principle

> Build the smallest system that convincingly proves the core thesis: an Ethiopian business owner can enter their business information once, see honestly how prepared they are for financing, and walk away with a professional loan document in their own language — without SENED ever pretending to be the bank.
