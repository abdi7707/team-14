import { router, Stack } from 'expo-router';

import { PotentialMatchCard } from '@/components/potential-match-card';
import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { RESEARCH_NOTE } from '@/lib/institutions';
import { runMatchingEngine } from '@/lib/matching';

export default function MatchesScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const matches = passport ? runMatchingEngine(passport) : [];

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Potential matches' }} />
      {loading ? (
        <LoadingNote message="Comparing your passport…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to see potential matches"
          message="Preparation readiness is calculated from your Business Passport."
        />
      ) : !passport ? (
        <EmptyState
          icon={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
          title="Add your business first"
          message="Potential matches are calculated from your Business Passport."
          actionLabel="Add business basics"
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {RESEARCH_NOTE} These figures are a hackathon sample, not an official product list.
          </ThemedText>
          {matches.map((match) => (
            <PotentialMatchCard key={match.product.id} match={match} />
          ))}
        </>
      )}
    </Screen>
  );
}
