# SENED AI — Individual Assignments

**7-hour schedule — Cursor AI Hackathon.** All times are hours from the official start
(write it here: **0:00 = ____**). Gates and the cut rule come from `SENED_task.md` §3 and §29.

This reorganizes `SENED_task.md` by person instead of by phase. Each developer owns one
vertical end to end: Abdulkarim owns the server (accounts, AI generation, PDFs, money)
and Yasmin owns the app the business owner touches (passport, matches, documents).
Abdisa and Filimon own the evidence, the story, the deck, and the demo. Shared tasks are
explicitly marked and must be done together rather than duplicated.

Companion documents: `SYSTEM_DESIGN.md` (architecture), `SENED_task.md` (master plan),
`SENED_git-workflow.md` (branching, review, and merge process).

| Clock | Abdulkarim | Yasmin | Abdisa | Filimon |
|---|---|---|---|---|
| 0:00–0:30 | Monorepo + API scaffold, contracts | Expo scaffold, contracts | Kickoff, problem research | Rules & submission checklist |
| 0:30–2:30 | Database, auth, AI generation | API client, auth UI, passport, generate button | Problem & lender research | Deck structure & visuals |
| 2:30–4:15 | PDF, payments & credits (P1) | Document flow, financing engine | Lender data handoff, competitors | Demo script & demo data |
| 4:15–5:15 | Rate limits, deployment | Language switcher (P1), demo build | Pitch narrative | First-time user testing |
| 5:15–6:00 | Integration & fixes | Integration & fixes | Deck content final | Final screenshots |
| 6:00–7:00 | Rehearsal support | Rehearsal support | Rehearsal | Backup video, submission |

---

## Abdulkarim — Backend, AI & Platform

Monorepo, API server, database, authentication, AI document generation, PDF rendering,
payments and credits, and deployment. These sit underneath the app, so the foundations
land first and Yasmin builds against stable contracts.

### Task 1 — Monorepo & API scaffold (0:10–0:30)
**Depends on:** kickoff (Task 27).

> Create the pnpm workspace (`pnpm-workspace.yaml`, `tsconfig.base.json`, root
> `package.json` with a `typecheck` script). Set up `artifacts/api-server` with
> Express 5 and TypeScript: environment loading, JSON body parsing, CORS, pino-http
> logging, an error handler, and `GET /api/healthz`. Add `.gitignore` and `.env.example`
> with every variable name from `SYSTEM_DESIGN.md` §13.2.

**Verify:** `pnpm install` works on both developer laptops; `/api/healthz` responds;
`.env` is gitignored; the server refuses to boot without `SESSION_SECRET`.

### Task 2 — Shared contracts (0:15–0:25, while installs run)
**Shared with:** Yasmin — done together, live, not in parallel.

> Define the Zod schemas in `lib/api-zod`: `RegisterBody`, `LoginBody`, `AuthResponse`
> (`{ token, user }`), `User`, `Language` (`EN | AM | OM`), `DocType`,
> `GenerateDocumentBody` (`{ docType, language, businessId, passport }`),
> `GeneratedDocument` (`{ id, docType, language, status, content: { title, sections } }`),
> and `ApiError`. Agree on the passport payload the server accepts.

**Verify:** both developers agree on every field before writing logic against it; no
second, incompatible copy of these types exists in the app or the server.

### Task 3 — Database schema v1 (0:30–0:55)
**Depends on:** Task 1.

> Create `lib/db` with Drizzle and the `users` and `generated_documents` tables
> (columns from `SYSTEM_DESIGN.md` §8.1). Push the schema to the hosted PostgreSQL
> database that both developers share.

**Verify:** both tables exist; a user row can be inserted and read back.

### Task 4 — Authentication API (0:55–1:30)
**Depends on:** Tasks 2–3.

> Implement `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.
> Hash passwords with bcrypt (cost 10), sign 30-day JWTs with `SESSION_SECRET`, and make
> `requireAuth` load the user and role from the database on every request. Emails in
> `ADMIN_EMAILS` get the `admin` role at registration.

**Verify:** register → login → me works with curl; a wrong password returns 401; a
tampered token returns 401; changing a role in the database takes effect immediately.

### Task 5 — AI document generation (1:30–2:20)
**Depends on:** Task 4.

> Make `POST /api/documents/generate` callable by 2:15 so Yasmin can wire it before
> Gate 2. Add `docGeneration.ts` (spec for the Loan Request Letter: title and outline) and
> `docLanguage.ts` (language block for EN, AM, OM). Call Gemini (`gemini-flash-latest`)
> with the spec, the passport data from the client, and the language block. Validate
> the `{ title, sections: [{ heading, body }] }` output with Zod. Track the row through
> `GENERATING → READY / FAILED`, append the trilingual draft disclaimer, and add
> `GET /api/documents/mine` and `GET /api/documents/:id` with ownership checks.

**Verify:** a loan letter is generated from a sample passport in English and in
Amharic; it contains no figures that are not in the passport; malformed AI output ends
as `FAILED` with a clear error; another user cannot read the document.

→ **Gate 2 at 2:30** (with Yasmin): the app generates a letter from real passport data.

### Task 6 — PDF rendering (2:30–3:15)
**Depends on:** Task 5.

> Add `pdf.ts` with pdfkit, embedding Noto Sans and Noto Sans Ethiopic. Serve
> `GET /api/documents/:id/pdf` to the owner only, with the disclaimer included.

**Verify:** an Amharic PDF shows Ethiopic characters, not empty boxes; a non-owner is
refused.

### Task 7 — Payments, credits & admin approval (3:15–4:15) — P1
**Depends on:** Task 4 and a passed Gate 2. Cut at Gate 3 if it is not working.

> Add `products`, `payments`, and `entitlements` with their constraints (unique
> `entitlements.payment_id`; partial unique index on `payments.transaction_id` where
> `status <> 'REJECTED'`, applied with manual SQL). Add the idempotent bootstrap
> (3 products, `ADMIN_EMAILS`), `GET /api/products`, `POST /api/payments`,
> `GET /api/payments/mine`, `GET /api/entitlements/mine`, and the admin list, approve,
> and reject routes. Switch generation to consume a credit with the guarded update and
> refund only on the guarded `GENERATING → FAILED` transition. Build the minimal
> `(store)` screens yourself (catalog, checkout with transaction ID, admin approve and
> reject) so the vertical stays end to end.

**Verify:** approving twice creates one entitlement; a reused transaction ID is
rejected; a user with 0 credits cannot generate; a failed generation refunds exactly
one credit.

### Task 8 — Rate limits & hardening (4:15–4:30) — P1
**Depends on:** Tasks 4–7.

> Add express-rate-limit (auth 30 per 15 minutes, payments 10 per minute, generation
> 6 per minute) and enable `trust proxy`. Confirm logs never contain passwords, tokens,
> or document contents.

**Verify:** the 31st login attempt in 15 minutes gets HTTP 429.

### Task 9 — API deployment (4:30–5:15)
**Depends on:** Gate 3.

> Deploy the API (esbuild bundle with `pdfkit` and `fontkit` external) to a PaaS.
> Configure production secrets, run the schema push and the partial index SQL on the
> production database, and give Yasmin the public API URL.

**Verify:** the deployed `/api/healthz`, register, generate, and PDF all work; another
teammate could repeat the deployment from the README notes.

### Task 10 — Integration & fix pass (5:15–6:00)
**Shared with:** Yasmin.

> Run the full demo path on the real demo device against the final API. Fix only
> demo-blocking bugs. At 6:00, freeze code and tag `v1.0.0`.

**Verify:** the full demo path works twice in a row without manual database fixes.

---

## Yasmin — Mobile App & On-device Engines

The Expo app, navigation, UI kit, Business Passport, financing intelligence, document
flow, and multilingual UI. Yasmin owns these surfaces end to end while Abdulkarim owns
the server contracts they call.

### Task 2 — Shared contracts (0:15–0:25, while installs run)
**Shared with:** Abdulkarim — done together, live.

> See Abdulkarim's Task 2 above: same task, run once, together.

### Task 11 — Expo app scaffold & UI kit (0:10–0:45)
**Depends on:** kickoff (Task 27); moves into the workspace once Task 1 is pushed.

> Create `artifacts/sened-mobile` with Expo 54, expo-router 6, and TypeScript. Add the
> route groups `(auth)`, `(onboarding)`, `(tabs)`, `(passport)`, `(financing)`,
> `(document)`, the tabs Home, Business, Documents, Financing, and Profile, the UI kit
> (`Button`, `Card`, `Input`, `Badge`, `ProgressBar`, `EmptyState`, `ScreenHeader`),
> `constants/colors.ts`, and an `ErrorBoundary`.

**Verify:** the app runs in Expo web and in Expo Go; every tab renders without crashing.

### Task 12 — API client & auth flow (0:45–1:30)
**Depends on:** Tasks 2 and 11 (mock responses until Task 4 lands).

> Build `lib/api.ts` with the base URL from `EXPO_PUBLIC_DOMAIN`, the Bearer header,
> and typed errors. Add `AuthProvider` (`@sened:auth_token`, `@sened:user`) and the
> welcome, login, and register screens.

**Verify:** register and login work against Abdulkarim's API; the session survives an
app reload; logout clears it; API errors appear as readable messages.

### Task 13 — Business Passport (1:30–2:15)
**Depends on:** Task 11.

> Define the `BusinessPassport` type for the MVP sections (`SENED_task.md` §7) with
> `StructuredAmount` for money. Add `BusinessProvider` (`@sened:businesses:<userId>`,
> `@sened:active_business:<userId>`), onboarding (business basics, financing goal), the
> passport overview and section forms, and `lib/passport.ts` (completeness and next
> best action). Show both on Home.

**Verify:** completing a section raises completeness; data persists after reload;
another user on the same device sees nothing.

### Task 14 — Document flow (2:15–3:15)
**Depends on:** Tasks 5 and 13.

> First, by 2:30: a "Generate Loan Request Letter" action that sends the active
> passport to `POST /api/documents/generate` and shows the result. Then the full
> `(document)` flow: choose document type, choose language, generate with a loading
> state, view the sections, and download the PDF with `fetch` plus the Bearer header
> (expo-sharing on native through a dynamic import so web does not break).

**Verify:** Gate 2 passes at 2:30; an Amharic letter can be generated, viewed, and
saved as a PDF from the app.

### Task 15 — Financing intelligence (3:15–4:15)
**Depends on:** Task 13 and Abdisa's lender data (Task 19). Use labeled sample data
until it arrives.

> Build the institution registry (start with 3, target 6: CBE, DBE, Dashen, Awash,
> CoopOro, ACSI) with `source` and `reliability` on every requirement. Implement
> `runMatchingEngine`, `calculateFitScore`, `checkRequirements`, and
> `calculateReadiness`, plus the matches and product screens.

**Verify:** matches change when passport data changes; missing requirements are
listed; no screen says "approved", "eligible", or "guaranteed".

### Task 16 — Multilingual UI (4:15–4:45) — P1
**Depends on:** P0 screens done.

> Add `I18nProvider` with `[English, Amharic, Oromo]` tuples for the main screens and a
> language switcher on Profile. Default the document language to the UI language.

**Verify:** switching language changes the main screens without breaking layouts;
a teammate who reads Amharic or Afaan Oromoo has checked the key terms.

### Task 17 — Demo build & environment (4:45–5:15)
**Depends on:** Task 9 (or the local fallback decided at Gate 1).

> Point `EXPO_PUBLIC_DOMAIN` at the final API. Prepare the demo build (Expo web export,
> or Expo Go on the demo phone) and the demo account with Filimon's demo data.

**Verify:** a clean browser or phone runs the full demo path against the final API.

### Task 10 — Integration & fix pass (5:15–6:00)
**Shared with:** Abdulkarim.

> See Abdulkarim's Task 10 above.

---

## Abdisa — Research & Pitch Story

Abdisa owns the evidence behind SENED: the problem, the market, the lender data the app
relies on, the competition, and the narrative of the pitch.

### Task 18 — Problem & market research (0:10–1:30)
**Depends on:** kickoff (Task 27).

> Document why Ethiopian SMEs are rejected or never apply for loans: incomplete
> paperwork, unclear lender requirements, no professional documents. Find 2–3 credible
> data points on the SME financing gap and on Telebirr adoption, with sources.

**Verify:** every number that will appear in the deck has a source link.

### Task 19 — Lender requirements research (1:30–3:00)
**Depends on:** Task 18.

> For at least 3 institutions (target all 6: CBE, DBE, Dashen, Awash, CoopOro, ACSI),
> collect one or two SME loan products, the typical amount range, key requirements, and
> a source link. Put it in one simple table tagged `MANUAL_RESEARCH` / `MEDIUM`
> reliability.

**Verify:** Yasmin receives the table by **3:00** and can enter it without follow-up
questions.

### Task 20 — Competitive analysis (3:00–3:45)
**Depends on:** Task 18.

> Compare SENED with loan officers, paid business-plan consultants, generic AI chat
> tools, and bank apps. State what SENED does differently (one Business Passport reused
> for every lender and document, trilingual, honest readiness) and what it does not do.

**Verify:** the team can explain the differentiation without claiming that no
alternatives exist.

### Task 21 — Pitch narrative & speaker notes (3:45–5:15)
**Depends on:** Tasks 18–20.

> Write the story slide by slide: problem → solution → live demo → business model
> (Telebirr purchases: Loan Request Letter 149 ETB, Business Plan 699 ETB, Loan Ready
> Package 1,499 ETB) → trust (never promises approval, drafts only) → roadmap → team.

**Verify:** the pitch fits the time limit and every "built" claim matches the working
demo; everything else is labeled roadmap.

---

## Filimon — Deck Design, Demo & Submission

Filimon owns how SENED is presented: the deck, the visuals, the demo script and data,
first-time user testing, the backup video, and the final submission.

### Task 22 — Rules & submission checklist (0:10–0:30)
**Depends on:** kickoff (Task 27).

> Read the hackathon rules. Record the submission deadline, required items (repo link,
> video, deck, form), time limits, and judging criteria. Share them at the first
> check-in.

**Verify:** the whole team knows the exact deadline and what must be submitted.

### Task 23 — Deck structure & visuals (0:30–2:30)
**Depends on:** Task 22.

> Build the slide template using the app colors from Yasmin. Turn the diagrams in
> `SYSTEM_DESIGN.md` (system context, purchase → approval → entitlement, financing
> preparation) into clean slides, plus a user-journey visual.

**Verify:** the deck skeleton has every slide from Abdisa's outline, ready for content.

### Task 24 — Demo script & demo data (2:30–3:30)
**Depends on:** Task 23 and the Gate 2 vertical slice.

> Write a step-by-step demo script with timings around one persona. Prepare realistic
> passport data for the demo business and hand it to Yasmin for the demo account.

**Verify:** the script runs end to end on the current build in the time allowed.

### Task 25 — First-time user testing (4:15–5:15)
**Depends on:** integrated MVP.

> Use the app as a new business owner would. Report confusing screens and bugs as
> GitHub issues (label `bug`) with steps to reproduce. Check the potential-match wording
> and the disclaimer, and review Amharic or Afaan Oromoo text if you read it.

**Verify:** every demo-blocking issue has an owner before 5:30.

### Task 26 — Screenshots, backup video & submission (5:15–6:45)
**Depends on:** code freeze at 6:00.

> Capture final screenshots for the deck and README. Right after code freeze, record the
> backup demo video. Submit the repository link, deck, and video by **6:45**.

**Verify:** the submission confirmation is received before the deadline.

---

# Shared Team Tasks

These tasks belong to all four members and should not be silently assigned to one
person.

### Task 27 — Kickoff & scope lock (0:00–0:10)
**Shared with:** whole team.

> Agree on the MVP (`SENED_task.md` §24), the gates, the cut rule, the demo setup, and
> who presents. Share secrets privately.

**Verify:** everyone can state the MVP in one sentence and knows their first task.

### Task 28 — Hourly check-ins (every hour)
**Shared with:** whole team.

> Three minutes, on the hour, using `SENED_task.md` §27: done, next, blockers,
> integration needs, evidence.

**Verify:** no one is blocked for more than 15 minutes without the team knowing.

### Task 29 — End-to-end vertical slice (2:30)
**Coordinates:** Abdulkarim + Yasmin; Abdisa and Filimon take the first screenshots.

> Demonstrate one complete flow:
>
> `Register → passport → generate Loan Request Letter (Gemini) → view in the app`

**Verify:** the flow works with real components rather than mock screens.

### Task 30 — Trust & wording review (4:15–4:30)
**Shared with:** whole team.

> Search the app, AI outputs, deck, and README for "approved", "eligible", and
> "guaranteed". Confirm every generated document carries the draft disclaimer and that
> no secret is in the repository.

**Verify:** SENED never promises approval anywhere, including the pitch.

### Task 31 — Demo rehearsal (6:00–6:45)
**Shared with:** whole team.

> Rehearse the pitch and live demo at least twice on the final build. Time it. Agree on
> fallbacks: pre-generated document, backup account, backup video.

**Verify:** the demo can be completed repeatedly without manual backend or database
fixes.

---

# Dependency Order

The implementation order is:

```text
Kickoff & scope lock
      ↓
Monorepo + API scaffold + Expo scaffold
      ↓
Shared contracts (lib/api-zod)
      ↓
Database + auth API  ·  Business Passport (on-device)
      ↓
AI document generation
      ↓
Document flow UI → Gate 2 vertical slice
      ↓
PDF (Ethiopic)  ·  Financing engine (needs lender research)
      ↓
Payments & credits (P1)  ·  Multilingual UI (P1)
      ↓
Deployment + demo build
      ↓
Integration & fixes → code freeze 6:00
      ↓
Rehearsal & submission
```

---

# Ownership Summary

| Area | Owner | Backup / Contributor |
|---|---|---|
| Monorepo & tooling | Abdulkarim | Yasmin |
| API server & auth | Abdulkarim | Yasmin |
| Database | Abdulkarim | Yasmin |
| AI document generation | Abdulkarim | Yasmin |
| PDF rendering | Abdulkarim | Yasmin |
| Payments & credits (API + store screens) | Abdulkarim | Yasmin |
| API deployment | Abdulkarim | Yasmin |
| Shared contracts | Abdulkarim + Yasmin | — |
| App shell & UI kit | Yasmin | Abdulkarim |
| Business Passport | Yasmin | Abdulkarim |
| Document flow UI | Yasmin | Abdulkarim |
| Financing intelligence | Yasmin | Abdisa (data) |
| Multilingual UI | Yasmin | Abdisa, Filimon (review) |
| Demo build | Yasmin | Abdulkarim |
| Problem & market research | Abdisa | Filimon |
| Lender requirements data | Abdisa | Yasmin |
| Competitive analysis | Abdisa | Filimon |
| Pitch narrative | Abdisa | Filimon |
| Deck design & visuals | Filimon | Abdisa |
| Demo script & demo data | Filimon | Abdisa |
| User testing | Filimon | Abdisa |
| Backup video & submission | Filimon | Abdisa |
| Rehearsal | All | — |

---

# Working Rules

1. **Owner means accountable, not isolated.** Anyone can help.
2. **Shared contracts are agreed before dependent code is written.**
3. **No one silently changes a shared contract, database schema, environment variable
   name, or storage key.**
4. **Auth, payments, and credit code is reviewed by the other developer before merge.**
5. **Integrate early.** First real app-to-API call by 1:30; vertical slice by 2:30.
6. **One vertical slice first.** One working flow beats many disconnected screens.
7. **The pitch tells the truth.** Only features that work in the demo are presented as
   built; everything else is labeled roadmap.
8. **Trust rule.** SENED never says "approved", "eligible", or "guaranteed", and every
   generated document is labeled a draft.
9. **Every completed task needs evidence:** a PR, a screenshot, a slide, or a source link.
10. **Do not manufacture history.** The repository and `CHANGELOG.md` reflect the work
    actually done during the hackathon.
11. **Cut rule.** If it is not working at its gate, cut it.

---

# Definition of Done

A task is complete only when:

- Implementation, design, or research is actually finished.
- Its verification criteria pass.
- The work is merged or delivered (PR merged, table handed over, slide done).
- Dependencies and handoffs are communicated at the check-in.
- Related documentation is updated.
- Another teammate can understand or use the result.
- Any known limitation is written down.

---

# Final Team Principle

> **Four people, one product, seven hours.**

The final repository and pitch should make the ownership obvious:

```text
Abdisa
  → finds the evidence and writes the story

Filimon
  → turns it into the deck, the demo script, and the backup video

Yasmin
  → builds the app the business owner touches: passport, matches, documents

Abdulkarim
  → builds the server that guards accounts, AI generation, PDFs, and money

All four
  → integrate, test, rehearse, and submit one coherent product
```
