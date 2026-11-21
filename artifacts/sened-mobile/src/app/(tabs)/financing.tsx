import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { PotentialMatchCard } from '@/components/potential-match-card';
import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, EmptyState, ProgressBar, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { RESEARCH_NOTE } from '@/lib/institutions';
import { averageReadiness, runMatchingEngine } from '@/lib/matching';

export default function FinancingScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const matches = passport ? runMatchingEngine(passport) : [];
  const readiness = averageReadiness(matches);
  const businessName = passport?.identity.businessName.trim() ?? '';

  return (
    <Screen>
      <ScreenHeader title="Financing" subtitle="See potential matches and your preparation readiness." />
      {loading ? (
        <LoadingNote message="Checking your passport…" />
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
          <Card>
            <ThemedText type="defaultSemiBold">{businessName || 'Untitled business'}</ThemedText>
            <ProgressBar value={readiness} accessibilityLabel="Preparation readiness" />
            <ThemedText type="small">{readiness}% preparation readiness</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Averaged across the sample products. Missing facts, such as a TIN or a license, lower it.
            </ThemedText>
          </Card>
          {matches.slice(0, 3).map((match) => (
            <PotentialMatchCard key={match.product.id} match={match} />
          ))}
          <Button title="See potential matches" onPress={() => router.push('/matches')} />
          <ThemedText type="caption" themeColor="textSecondary" style={styles.note}>
            {RESEARCH_NOTE} SENED shows potential matches and preparation readiness. It never promises loan approval.
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { textAlign: 'center' },
});
