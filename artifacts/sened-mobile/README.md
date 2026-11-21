# SENED AI — Mobile app

Expo SDK 58 app (expo-router, TypeScript) for SENED AI. Owner: Yasmin.
Tasks and time slots are in `SENED_team_assignments_7hr.md` at the repository root.

## Run

```bash
pnpm install
pnpm start        # press w for web, or scan the QR code with Expo Go (SDK 58)
pnpm typecheck
```

## Structure

```text
src/app/              expo-router screens
  (tabs)/             Home, Business, Documents, Financing, Profile
  (auth)/             welcome, login, register
  (onboarding)/       business-basics, goal
  (passport)/         overview, identity, location, legal, operations, financial
  (financing)/        matches, product
  (document)/         select, preview
src/components/       Screen, ThemedText, ThemedView, ErrorFallback, PlaceholderScreen
src/components/ui/    Button, Card, Input, Badge, ProgressBar, EmptyState, ScreenHeader
src/constants/        theme (colors, spacing, radius)
src/context/          AuthProvider, BusinessProvider, DocumentProvider, I18nProvider
src/hooks/            useTheme
src/lib/              API client, passport completeness, draft letter, financing match, i18n, storage keys
src/types/            BusinessPassport, document contract, financing registry
```

Route groups have no layout of their own, so every non-tab screen is pushed on the root stack
with a back button. The passport is stored on the device per account (`@sened:businesses:<userId>`).
Drafts are stored the same way (`@sened:docs:<userId>`).
Potential matches use a labeled sample registry until the lender research table arrives.
The UI language is stored on the device (`@sened:language`) and is the default for a new document.

Leave `EXPO_PUBLIC_DOMAIN` empty in `.env` to use on-device practice accounts. There is no
deployed API URL yet. When Abdulkarim sends one, set it to that origin with no path, for
example `http://192.168.1.20:3000`, then run `pnpm export:web` again.

## Demo

The API is not deployed, so the demo build uses practice accounts on the device.

```bash
pnpm export:web
```

The static site is written to `dist/`. On the welcome screen, choose **Open the demo business**.

| Account | Email | Password | What is on it |
|---|---|---|---|
| Demo | demo@sened.app | sened-demo | Jimma Highland Coffee. Operations are empty so one section can be completed live. An Amharic loan request letter is already saved. |
| Backup | backup@sened.app | sened-demo | The same business, with operations filled in. |

These passwords are for the on-device practice mode. They are not production credentials.

Suggested path, about four minutes:

1. Open the demo business. Home shows preparation still in progress.
2. Describe operations (washed coffee, 12 people) and save. Completeness reaches ready.
3. Open Financing and show a closer potential match. Say that it is not a loan decision.
4. Open the saved Amharic letter and use Save as PDF.
5. On Profile, switch to አማርኛ, then back to English.
