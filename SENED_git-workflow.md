# TEAM 14 — SENED AI
## Git Workflow & Collaboration Standard

**Project:** SENED AI — AI-powered business document and financing preparation platform for Ethiopian businesses  
**Team:** Team 14 — Abdulkarim, Yasmin (developers) · Abdisa, Filimon (research & pitch)  
**Repository:** `github.com/abdi7707/team-14`  
**Version:** 1.0

---

# 1. Purpose

This document defines how Team 14 uses Git and GitHub during the 7-hour Cursor AI Hackathon.

Goals:

- Keep `main` stable and demo-ready at every gate.
- Make work traceable from task to pull request.
- Prevent the two developers from overwriting each other.
- Make the history show the real work done during the hackathon.
- Keep reviews fast (minutes, not hours).
- Make rollback possible if a late change breaks the demo.

Seven hours changes the rhythm, not the discipline: branches live for one to two hours, pull requests are small, and everyone merges to `main` often.

# 2. Branch Structure

```text
main
│
├── feat/...
├── fix/...
├── refactor/...
├── docs/...
├── test/...
└── chore/...
```

`main` is the stable/demo branch.

Rules:

- Never develop directly on `main`.
- Never force-push `main`.
- Never merge unfinished work.
- Keep `main` runnable: after every merge the app and API must still start.

# 3. Branch Naming

Use lowercase kebab-case.

### Features

```text
feat/api-auth
feat/db-schema
feat/ai-doc-generation
feat/pdf-export
feat/payments-credits
feat/mobile-shell
feat/business-passport
feat/document-flow
feat/financing-matching
feat/i18n-switcher
```

### Fixes

```text
fix/ethiopic-pdf-font
fix/expo-web-sharing
fix/jwt-role-check
```

### Refactoring

```text
refactor/passport-engine
refactor/shared-schemas
```

### Documentation

```text
docs/readme-setup
docs/api-contracts
docs/pitch-deck
```

### Tests

```text
test/credit-guard
test/matching-engine
```

### Chores

```text
chore/pnpm-workspace
chore/env-example
```

# 4. Branch & Folder Ownership

One person owns a feature branch. Others can help, but two people should not independently rewrite the same branch.

Folder ownership keeps the two developers out of each other's way:

| Path | Owner | Rule |
|---|---|---|
| `artifacts/api-server/`, `lib/db/` | Abdulkarim | Others ask before editing |
| `artifacts/sened-mobile/` | Yasmin | Except `app/(store)/`, which Abdulkarim builds with the payments API |
| `lib/api-zod/` (shared contracts) | Both | Change only after telling the other developer |
| Root config (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.env.example`) | Abdulkarim | Tell the team before changing |
| `docs/pitch/` | Abdisa, Filimon | Deck exports and screenshots |

### Git for the pitch team (no command line needed)

Abdisa and Filimon can contribute from the GitHub website:

1. Open the repository → **Add file** → **Upload files** (or edit a Markdown file).
2. Choose **"Create a new branch for this commit and start a pull request"**.
3. Name the branch `docs/pitch-deck` (or similar) and open the pull request.
4. Ask a developer to merge it.

Never choose "Commit directly to the main branch".

# 5. Create a Branch

Always start from the current `main`:

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

# 6. Before Starting Work

```bash
git status
git branch
git pull origin main
```

Confirm you are on the correct branch with a clean starting point.

# 7. Commit Convention

Use:

```text
type(scope): short description
```

Examples:

```text
feat(api): add register and login with bcrypt and JWT
feat(db): add users and generated_documents tables
feat(ai): generate loan request letter with Gemini
feat(pdf): render documents with Noto Sans Ethiopic
feat(passport): add identity, financial, and financing sections
feat(financing): add matching engine and readiness score
feat(store): submit Telebirr payment with transaction ID
feat(admin): approve payment and grant entitlement
feat(i18n): add Amharic and Afaan Oromoo catalogs

fix(credits): refund only on GENERATING to FAILED transition
fix(pdf): embed Ethiopic font for Amharic output
fix(mobile): load expo-sharing dynamically on web

refactor(passport): extract completeness calculation

test(financing): add fit score cases

docs(readme): add setup and demo account
chore(repo): add pnpm workspace and tsconfig base
```

Useful scopes: `api`, `db`, `auth`, `ai`, `pdf`, `payments`, `credits`, `admin`, `mobile`, `passport`, `financing`, `documents`, `i18n`, `store`, `pitch`, `repo`, `deploy`.

# 8. Commit Types

| Type | Meaning |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Behavior-preserving restructuring |
| `test` | Tests |
| `docs` | Documentation, pitch assets |
| `chore` | Tooling/configuration |
| `perf` | Performance |
| `build` | Build/dependency changes |

Avoid meaningless messages such as `update`, `changes`, `final final`, `fix stuff`, or `everything`.

# 9. Commit Size

Prefer focused commits:

```text
feat(db): add payments and entitlements tables
feat(payments): add submit and list endpoints
feat(admin): add approve and reject endpoints
```

Avoid putting an entire subsystem into one opaque commit when smaller logical commits are practical.

### Working with Cursor agents

AI agents can change many files in one go. Before committing:

- Read the diff. Do not commit code you cannot explain to your teammate.
- Stage by path or with `git add -p` so each commit stays about one thing.
- Check the agent did not touch the other developer's folders or shared contracts by accident.
- Check the agent did not write secrets, sample keys, or real passwords into files.
- Keep the project conventions in `.cursor/rules/` so both developers' agents follow the same structure and the potential-match wording rule.

# 10. Pull Request Workflow

```text
Task (SENED_task.md / issue)
 ↓
Branch
 ↓
Implementation
 ↓
Local check (typecheck + run it)
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Quick review
 ↓
Fix review comments
 ↓
Squash and merge
 ↓
Delete branch
```

Target: every branch is merged within **2 hours** of being created. Long-lived branches cause the worst conflicts.

# 11. Push

```bash
git push -u origin feat/your-feature
```

Later:

```bash
git push
```

Push at least every 30–45 minutes, even before the pull request is ready.

# 12. Pull Request Requirements

### Title

Follow the commit convention, for example:

```text
feat(ai): generate loan request letter with Gemini
```

### Description

Keep it short. Five lines are enough during a hackathon:

```text
## What
What was implemented?

## How to test
Steps or curl command the reviewer can run in 2 minutes.

## Contracts
Did lib/api-zod, the database schema, env variables, or storage keys change?

## Risks
Anything the reviewer should watch for?

Closes #<issue>
```

# 13. PR Checklist

- [ ] `pnpm run typecheck` passes.
- [ ] The app (Expo web or Expo Go) and the API still start.
- [ ] The changed flow works when you try it yourself.
- [ ] No secrets committed (`.env`, keys, database URLs).
- [ ] No unnecessary files committed (`node_modules`, build output, VoiceSOS reference files).
- [ ] `lib/api-zod`, schema, or `.env.example` changes are mentioned in the description.
- [ ] Wording follows the rule: "potential match" and "preparation readiness", never "approved" or "guaranteed".
- [ ] Loading and error states handled where the user can see them.
- [ ] PR description completed.

# 14. Review Rules

The other developer reviews every pull request, and responds within **10 minutes** of being asked.

These always need a careful review, never a rubber stamp:

- Authentication and role checks.
- Payments, admin approval, and entitlements.
- Credit consumption and refunds.
- Database schema changes.
- Shared contracts in `lib/api-zod`.
- AI prompts and AI output validation.
- Deployment configuration.

Small UI-only changes may be self-merged if the reviewer is deep in a task, but say so at the next check-in.

Review for correctness, security, the trust rules, and scope.

# 15. Merge Strategy

Use **Squash and merge** for feature pull requests.

Keep resulting history readable:

```text
main
│
├── chore(repo): add pnpm workspace, Express and Expo scaffolds
├── feat(api): add register and login with bcrypt and JWT
├── feat(passport): add business passport and completeness
├── feat(ai): generate loan request letter with Gemini
├── feat(pdf): render documents with Noto Sans Ethiopic
├── feat(financing): add matching engine and readiness score
└── fix(mobile): load expo-sharing dynamically on web
```

# 16. Keeping a Feature Branch Updated

Merge `main` into your branch after every gate, and whenever the other developer tells you a shared file changed:

```bash
git fetch origin
git switch main
git pull origin main
git switch feat/your-feature
git merge main
```

Or, for a developer comfortable with rebasing:

```bash
git fetch origin
git rebase origin/main
```

Do not rewrite a shared branch without agreement.

# 17. Merge Conflicts

1. Stop and understand both changes.
2. Do not blindly choose ours/theirs (and do not let an AI agent choose blindly either).
3. Resolve logically. For `pnpm-lock.yaml`, take `main`'s version and run `pnpm install`.
4. Run the typecheck and start the app.
5. Review the final diff.
6. Commit the resolution.

Useful commands:

```bash
git status
git diff
```

# 18. Never Do This

Never force-push `main`:

```bash
git push --force origin main
```

Do not use destructive reset commands unless you fully understand what will be lost.

Never commit, and never paste into AI chats:

```text
.env
GEMINI_API_KEY
SESSION_SECRET
DATABASE_URL
Cloud storage credentials
Admin passwords
Real customer business data
```

# 19. Environment Variables

Use a local `.env`; commit only `.env.example`.

`.env.example` for SENED (from `SYSTEM_DESIGN.md` §13.2):

```env
# API server
DATABASE_URL=
SESSION_SECRET=
GEMINI_API_KEY=
ADMIN_EMAILS=
PORT=
NODE_ENV=
LOG_LEVEL=

# Object storage (P2 — only if uploads are built)
PRIVATE_OBJECT_DIR=
PUBLIC_OBJECT_SEARCH_PATHS=

# Mobile app
EXPO_PUBLIC_DOMAIN=
```

Never place real values in `.env.example`. Anything prefixed `EXPO_PUBLIC_` is bundled into the app and visible to users, so it must never hold a secret.

# 20. `.gitignore`

At minimum:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
web-build/
.expo/
coverage/
*.tsbuildinfo
.DS_Store
*.log

# Reference documents from another team (do not commit)
git-workflow.md
VoiceSOS_team_assignments_3week.md
task (4).md
```

Also add `.env` to `.cursorignore` so AI tools do not read secrets.

# 21. GitHub Issues

During kickoff, create one issue per P0 and P1 task from `SENED_team_assignments_7hr.md` (about 15 issues). Copy the task title and its **Verify** line as the acceptance criteria.

Useful categories:

```text
feature
bug
research
design
documentation
security
testing
deployment
pitch
```

Example:

```text
[Feature] Generate Loan Request Letter with Gemini
```

Filimon's user-testing bugs (Task 25) also go in as issues with steps to reproduce.

# 22. Issue-to-PR Traceability

Whenever practical:

```text
Issue #5
↓
Branch feat/ai-doc-generation
↓
Commits
↓
PR #9
↓
Merge
```

Use GitHub issue-closing syntax in the pull request description:

```text
Closes #5
```

# 23. Changelog Discipline

Judges and the pitch both benefit from a clear record of what was built. At every gate, the person who tags the milestone adds a short entry to `CHANGELOG.md`:

- Clock time and date.
- Contributor(s).
- What changed and why.
- Related PRs.
- Important decisions (for example, "cut payments at Gate 3").
- Notable ways Cursor helped (agents, rules, reviews), which is useful material for the pitch.

Do not manufacture history. The repository and changelog must represent work actually done during the hackathon.

# 24. Hackathon Git Routine

Start of a task:

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

During work:

```bash
git status
git diff
```

Commit logically (stage by path, not everything at once):

```bash
git add artifacts/api-server/src/routes/auth.ts
git commit -m "feat(auth): add register and login routes"
```

Push:

```bash
git push -u origin feat/your-feature
```

# 25. Before-Each-Gate Routine

- [ ] Push all work to the remote.
- [ ] Open or merge the pull request for finished work.
- [ ] Mark unfinished work clearly (draft PR).
- [ ] Update issue status.
- [ ] Report blockers at the check-in.
- [ ] Tell your teammate about integration dependencies (new endpoint, changed contract, new env variable).

Never leave important work only on one laptop.

# 26. Hotfix Workflow

After the 6:00 code freeze, only demo-blocking fixes are allowed, and both developers must agree:

```text
main
 ↓
fix/demo-blocker
 ↓
test the demo path
 ↓
PR + review
 ↓
merge
 ↓
redeploy
 ↓
re-run the demo path
```

If a fix is risky, do not merge it. Use the fallback (pre-generated document, backup account, or backup video) instead.

# 27. Milestone Tags

When a real milestone is stable:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Milestones (aligned with the gates in `SENED_task.md` §29):

```text
v0.1.0 — Foundation (0:30)
v0.2.0 — Vertical slice: register → passport → AI letter (2:30)
v0.3.0 — Feature complete: PDF, Amharic, financing matches (4:15)
v0.4.0 — Integrated & deployed (5:15)
v1.0.0 — Code freeze / final hackathon release (6:00)
```

Only tag genuine milestones. If a gate slips, tag it when it really passes.

# 28. Recommended GitHub Labels

Optional; skip them if they cost time.

```text
priority:p0
priority:p1
priority:p2

area:mobile
area:api
area:db
area:ai
area:pdf
area:payments
area:passport
area:financing
area:i18n
area:pitch
area:deployment
area:security

status:blocked
status:needs-review
status:ready
```

Optional ownership labels:

```text
owner:abdulkarim
owner:yasmin
owner:abdisa
owner:filimon
```

# 29. Shared Files

Changes to these deserve extra care:

```text
SYSTEM_DESIGN.md
SENED_task.md
SENED_team_assignments_7hr.md
SENED_git-workflow.md
README.md
CHANGELOG.md
.env.example
pnpm-workspace.yaml / root package.json
lib/api-zod/ (shared contracts)
lib/db/ (database schema)
artifacts/sened-mobile/types/ (domain types)
.cursor/rules/
```

Communicate before two people edit the same contract, schema, or planning file.

# 30. Shared Type Strategy

Keep the canonical API shapes in one place:

```text
lib/api-zod/
├── auth.ts        # RegisterBody, LoginBody, AuthResponse, User
├── documents.ts   # DocType, Language, GenerateDocumentBody, GeneratedDocument
├── commerce.ts    # Product, Payment, Entitlement (P1)
└── errors.ts      # ApiError
```

On-device domain types stay in the app:

```text
artifacts/sened-mobile/types/
├── passport.ts    # BusinessPassport, StructuredAmount
└── financing.ts   # Institution, FinancingProduct, Requirement
```

Avoid duplicating the same definitions independently in the app and the server.

# 31. API Contract Rule

Before frontend/backend integration, agree on:

```text
Endpoint
HTTP method
Request body
Response body
Errors
Authentication
Status codes
```

The Zod schemas in `lib/api-zod` are the contract; `docs/api-contracts.md` lists the endpoints and links to them. The full endpoint list is in `SYSTEM_DESIGN.md` §7.2 and the hackathon subset is in `SENED_task.md` §11.

# 32. On-Device Storage Key Rule

The Business Passport and financing data live in AsyncStorage. Use the agreed keys from `SYSTEM_DESIGN.md` §6.2:

```text
@sened:auth_token
@sened:user
@sened:businesses:<userId>
@sened:active_business:<userId>
@sened:docs:<userId>
@sened:fin_saved:<userId>
```

Renaming a key makes saved data seem to disappear, including the prepared demo account. Do not rename or reshape stored data without telling the team.

# 33. Trust-Critical Merge Rule

The following cannot be merged casually:

- Authentication and role checks.
- Payment approval and entitlement creation.
- Credit consumption and refund logic.
- AI prompts and AI output validation (no invented facts, no approval promises).
- Financing match wording and readiness scoring.
- Secrets and environment handling.

Require:

1. Review by the other developer.
2. A manual test of the failure case (double approval, zero credits, malformed AI output, wrong owner).
3. Clear reference to `SYSTEM_DESIGN.md` (for example §9.3 for credit-safe generation).
4. Explicit acceptance criteria (the task's **Verify** line).

# 34. Definition of Done for Code

```text
Implementation
     +
Local check (typecheck + run it)
     +
Review
     +
Documentation (README / .env.example / contracts)
     +
Integration (works with the other developer's side)
     +
Traceability (issue → PR → changelog)
     =
DONE
```

# 35. Recommended Repository Protection

Configure GitHub (Settings → Branches) so that:

- `main` is protected.
- Pull requests are required before merging.
- Force pushes to `main` are disabled.
- `main` cannot be deleted.
- Secret scanning is enabled if available.

Do not require CI checks or approvals in GitHub during the hackathon (there is no CI yet, and a forced approval can block a solo fix at 6:30). Follow the review rule in section 14 instead.

# 36. Communication Rule

Git is not a substitute for communication.

Tell your teammates before:

- Changing an API contract in `lib/api-zod`.
- Changing the database schema.
- Adding or renaming an environment variable.
- Renaming an on-device storage key.
- Changing the UI kit or colors (the deck uses them too).
- Adding or upgrading a dependency (Expo and React Native versions break easily).
- Rewriting a major component.
- Cutting a feature (the pitch team must stop presenting it).

# 37. Final Git Principle

> **Make the repository tell the truth about how the product was built.**

The final history should make it possible to follow:

```text
Problem
 ↓
System design
 ↓
Scaffold
 ↓
Vertical slice
 ↓
MVP features
 ↓
Integration & deployment
 ↓
Demo
```
