import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { completenessLabel, nextBestAction, overallCompleteness } from '@/lib/passport';

const SIGN_IN_ACTION = {
  title: 'Sign in to start your passport',
  message: 'Your Business Passport stays on this device, tied to your account.',
  buttonTitle: 'Log in',
  href: '/login' as const,
};

export default function HomeScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? (activeBusiness?.passport ?? null) : null;
  const percent = overallCompleteness(passport);
  const action = user ? nextBestAction(passport) : SIGN_IN_ACTION;
  const businessName = passport?.identity.businessName.trim() ?? '';

  return (
    <Screen>
      <ScreenHeader title="SENED AI" subtitle="Prepare your business for financing." />

      <Card>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Business Passport</ThemedText>
          <Badge label={loading ? 'Loading' : completenessLabel(percent)} variant={badgeVariant(percent, loading)} />
        </View>
        {businessName ? <ThemedText type="small">{businessName}</ThemedText> : null}
        <ProgressBar
          value={loading ? 0 : percent}
          accessibilityLabel="Business Passport completeness"
        />
        <ThemedText type="small" themeColor="textSecondary">
          {loading ? 'Checking your passport…' : `${percent}% complete`}
        </ThemedText>
      </Card>

      {loading ? null : (
        <Card>
          <ThemedText type="caption" themeColor="textSecondary">
            NEXT BEST ACTION
          </ThemedText>
          <ThemedText type="defaultSemiBold">{action.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {action.message}
          </ThemedText>
          <Button title={action.buttonTitle} onPress={() => router.push(action.href)} />
        </Card>
      )}
    </Screen>
  );
}

function badgeVariant(percent: number, loading: boolean): 'neutral' | 'warning' | 'success' | 'info' {
  if (loading) return 'info';
  if (percent >= 100) return 'success';
  if (percent <= 0) return 'neutral';
  return 'warning';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
