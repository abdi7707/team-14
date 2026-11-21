import { router, Stack } from 'expo-router';

import { PotentialMatchCard } from '@/components/potential-match-card';
import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useI18n } from '@/context/i18n-context';
import { copy } from '@/lib/i18n';
import { runMatchingEngine } from '@/lib/matching';

export default function MatchesScreen() {
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const matches = passport ? runMatchingEngine(passport) : [];

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: t(copy.financing.matchesTitle) }} />
      {loading ? (
        <LoadingNote message={t(copy.financing.checking)} />
      ) : !user ? (
        <SignInPrompt title={t(copy.financing.signInTitle)} message={t(copy.financing.signInMessage)} />
      ) : !passport ? (
        <EmptyState
          icon={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
          title={t(copy.financing.emptyTitle)}
          message={t(copy.financing.emptyMessage)}
          actionLabel={t(copy.financing.emptyAction)}
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t(copy.financing.researchNote)} {t(copy.financing.sampleList)}
          </ThemedText>
          {matches.map((match) => (
            <PotentialMatchCard key={match.product.id} match={match} />
          ))}
        </>
      )}
    </Screen>
  );
}
