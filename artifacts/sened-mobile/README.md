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
  (financing)/        matches
  (document)/         select
src/components/       Screen, ThemedText, ThemedView, ErrorFallback, PlaceholderScreen
src/components/ui/    Button, Card, Input, Badge, ProgressBar, EmptyState, ScreenHeader
src/constants/        theme (colors, spacing, radius)
src/context/          AuthProvider, BusinessProvider
src/hooks/            useTheme
src/lib/              API client, passport completeness, storage keys
src/types/            BusinessPassport
```

Route groups have no layout of their own, so every non-tab screen is pushed on the root stack
with a back button. The passport is stored on the device per account (`@sened:businesses:<userId>`).

Leave `EXPO_PUBLIC_DOMAIN` empty in `.env` to use on-device practice accounts. Set it to the API
origin, for example `http://192.168.1.20:3000`, once register, login, and me are available.
