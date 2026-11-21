import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { PotentialMatchCard } from '@/components/potential-match-card';
import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, EmptyState, ProgressBar, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useI18n } from '@/context/i18n-context';
import { copy, fill } from '@/lib/i18n';
import { averageReadiness, runMatchingEngine } from '@/lib/matching';

export default function FinancingScreen() {
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const matches = passport ? runMatchingEngine(passport) : [];
  const readiness = averageReadiness(matches);
  const businessName = passport?.identity.businessName.trim() ?? '';

  return (
    <Screen>
      <ScreenHeader title={t(copy.tabs.financing)} subtitle={t(copy.financing.subtitle)} />
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
          <Card>
            <ThemedText type="defaultSemiBold">{businessName || t(copy.business.untitled)}</ThemedText>
            <ProgressBar value={readiness} accessibilityLabel={t(copy.financing.readiness)} />
            <ThemedText type="small">{fill(t(copy.financing.readiness), { percent: readiness })}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t(copy.financing.averageNote)}
            </ThemedText>
          </Card>
          {matches.slice(0, 3).map((match) => (
            <PotentialMatchCard key={match.product.id} match={match} />
          ))}
          <Button title={t(copy.financing.seeMatches)} onPress={() => router.push('/matches')} />
          <ThemedText type="caption" themeColor="textSecondary" style={styles.note}>
            {t(copy.financing.researchNote)} {t(copy.financing.trustNote)}
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { textAlign: 'center' },
});
