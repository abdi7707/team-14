import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useI18n } from '@/context/i18n-context';
import { completenessPhrase, copy, fill } from '@/lib/i18n';
import { overallCompleteness } from '@/lib/passport';

export default function BusinessScreen() {
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = activeBusiness?.passport;
  const percent = overallCompleteness(passport ?? null);
  const place = [passport?.location.city, passport?.location.region].filter((part) => part?.trim()).join(', ');

  return (
    <Screen>
      <ScreenHeader title={t(copy.tabs.business)} subtitle={t(copy.business.subtitle)} />
      {loading ? (
        <ThemedText themeColor="textSecondary">{t(copy.business.loading)}</ThemedText>
      ) : !user ? (
        <SignInPrompt title={t(copy.business.signInTitle)} message={t(copy.business.signInMessage)} />
      ) : !passport ? (
        <EmptyState
          icon={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
          title={t(copy.business.emptyTitle)}
          message={t(copy.business.emptyMessage)}
          actionLabel={t(copy.business.emptyAction)}
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <Card>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">
              {passport.identity.businessName || t(copy.business.untitled)}
            </ThemedText>
            <Badge
              label={t(completenessPhrase(percent))}
              variant={percent >= 100 ? 'success' : percent > 0 ? 'warning' : 'neutral'}
            />
          </View>
          {passport.identity.sector.trim() ? (
            <ThemedText type="small" themeColor="textSecondary">
              {passport.identity.sector.trim()}
            </ThemedText>
          ) : null}
          {place ? (
            <ThemedText type="small" themeColor="textSecondary">
              {place}
            </ThemedText>
          ) : null}
          <ProgressBar value={percent} accessibilityLabel="Business Passport completeness" />
          <ThemedText type="small" themeColor="textSecondary">
            {fill(t(copy.home.percentComplete), { percent })}
          </ThemedText>
          <Button title={t(copy.business.open)} onPress={() => router.push('/overview')} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
