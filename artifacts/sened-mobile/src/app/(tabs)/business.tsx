import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { completenessLabel, overallCompleteness } from '@/lib/passport';

export default function BusinessScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = activeBusiness?.passport;
  const percent = overallCompleteness(passport ?? null);
  const place = [passport?.location.city, passport?.location.region].filter((part) => part?.trim()).join(', ');

  return (
    <Screen>
      <ScreenHeader
        title="Business"
        subtitle="Your Business Passport is the single source of truth for every document and lender."
      />
      {loading ? (
        <ThemedText themeColor="textSecondary">Loading your passport…</ThemedText>
      ) : !user ? (
        <SignInPrompt
          title="Sign in to see your business"
          message="Each account keeps its own passport on this device."
        />
      ) : !passport ? (
        <EmptyState
          icon={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
          title="No business yet"
          message="Create your business to start filling in your Business Passport."
          actionLabel="Create your business"
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <Card>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">{passport.identity.businessName || 'Untitled business'}</ThemedText>
            <Badge
              label={completenessLabel(percent)}
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
            {percent}% complete
          </ThemedText>
          <Button title="Open passport" onPress={() => router.push('/overview')} />
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
