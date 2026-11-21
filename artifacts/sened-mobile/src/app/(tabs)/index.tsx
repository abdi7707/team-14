import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useI18n } from '@/context/i18n-context';
import { completenessPhrase, copy, fill, nextActionCopy, terms } from '@/lib/i18n';
import { nextActionId, overallCompleteness } from '@/lib/passport';

export default function HomeScreen() {
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? (activeBusiness?.passport ?? null) : null;
  const percent = overallCompleteness(passport);
  const action = nextActionCopy[user ? nextActionId(passport) : 'signIn'];
  const businessName = passport?.identity.businessName.trim() ?? '';

  return (
    <Screen>
      <ScreenHeader title="SENED AI" subtitle={t(copy.home.subtitle)} />

      <Card>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">{t(terms.businessPassport)}</ThemedText>
          <Badge
            label={loading ? t(copy.home.loading) : t(completenessPhrase(percent))}
            variant={badgeVariant(percent, loading)}
          />
        </View>
        {businessName ? <ThemedText type="small">{businessName}</ThemedText> : null}
        <ProgressBar value={loading ? 0 : percent} accessibilityLabel={t(terms.businessPassport)} />
        <ThemedText type="small" themeColor="textSecondary">
          {loading ? t(copy.home.checking) : fill(t(copy.home.percentComplete), { percent })}
        </ThemedText>
      </Card>

      {loading ? null : (
        <Card>
          <ThemedText type="caption" themeColor="textSecondary">
            {t(copy.home.nextAction)}
          </ThemedText>
          <ThemedText type="defaultSemiBold">{t(action.title)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t(action.message)}
          </ThemedText>
          <Button title={t(action.button)} onPress={() => router.push(action.href)} />
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
