import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { EmptyState, ScreenHeader } from '@/components/ui';

export default function FinancingScreen() {
  return (
    <Screen>
      <ScreenHeader title="Financing" subtitle="See potential matches and your preparation readiness." />
      <EmptyState
        icon={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
        title="Find potential matches"
        message="Compare your Business Passport with requirements from Ethiopian banks and microfinance institutions."
        actionLabel="See potential matches"
        onAction={() => router.push('/matches')}
      />
      <ThemedText type="caption" themeColor="textSecondary" style={styles.note}>
        SENED shows potential matches and preparation readiness. It never promises loan approval.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    textAlign: 'center',
  },
});
