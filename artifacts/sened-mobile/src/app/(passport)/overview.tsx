import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import {
  PASSPORT_SECTIONS,
  completenessLabel,
  nextBestAction,
  overallCompleteness,
  sectionCompleteness,
} from '@/lib/passport';

export default function PassportOverviewScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const passport = activeBusiness?.passport ?? null;
  const percent = overallCompleteness(passport);
  const action = nextBestAction(passport);
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Business Passport' }} />
      {loading ? (
        <LoadingNote message="Loading your passport…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to see your passport"
          message="Your Business Passport stays on this device, tied to your account."
        />
      ) : !activeBusiness || !passport ? (
        <EmptyState
          icon={{ ios: 'storefront.fill', android: 'storefront', web: 'storefront' }}
          title="No business yet"
          message="Add a business name to start the passport."
          actionLabel="Add business basics"
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <>
          <ScreenHeader
            title={passport.identity.businessName || 'Business Passport'}
            subtitle={`${percent}% complete`}
          />
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
          {PASSPORT_SECTIONS.map((section) => {
            const sectionPercent = sectionCompleteness(passport, section.id);
            return (
              <Card key={section.id} onPress={() => router.push(section.href)}>
                <View style={styles.row}>
                  <ThemedText type="defaultSemiBold">{section.title}</ThemedText>
                  <Badge label={completenessLabel(sectionPercent)} variant={badgeVariant(sectionPercent)} />
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {section.description}
                </ThemedText>
                <ProgressBar value={sectionPercent} accessibilityLabel={`${section.title} completeness`} />
              </Card>
            );
          })}
        </>
      )}
    </Screen>
  );
}

function badgeVariant(percent: number): 'neutral' | 'warning' | 'success' {
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
