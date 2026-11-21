import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ProgressBar } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { RESEARCH_NOTE } from '@/lib/institutions';
import { formatAmountRange, runMatchingEngine, sectionHref, strengthLabel } from '@/lib/matching';
import type { FitStrength, RequirementCheck } from '@/types/financing';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const match = passport ? runMatchingEngine(passport).find((item) => item.product.id === productId) : null;

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Potential match' }} />
      {loading ? (
        <LoadingNote message="Opening this product…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to see this product"
          message="Preparation readiness is calculated from your Business Passport."
        />
      ) : !match ? (
        <EmptyState
          icon={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
          title="Product not available"
          message="This sample product is not in the registry, or the business passport is missing."
        />
      ) : (
        <>
          <View style={styles.row}>
            <Badge label={strengthLabel(match.fit.strength)} variant={strengthVariant(match.fit.strength)} />
            <Badge label={match.institution.kind === 'bank' ? 'Bank' : 'Microfinance'} variant="neutral" />
          </View>
          <ThemedText type="title">{match.product.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {match.institution.name}
          </ThemedText>
          <ThemedText>{match.product.summary}</ThemedText>
          <ThemedText type="smallBold">{formatAmountRange(match.product)}</ThemedText>
          <Card>
            <ThemedText type="smallBold">Fit {match.fit.score}</ThemedText>
            {match.fit.reasons.map((reason) => (
              <ThemedText key={reason} type="small" themeColor="textSecondary">
                {reason}
              </ThemedText>
            ))}
          </Card>
          <Card>
            <ThemedText type="smallBold">{match.readiness}% preparation readiness</ThemedText>
            <ProgressBar value={match.readiness} accessibilityLabel="Preparation readiness" />
            <ThemedText type="small" themeColor="textSecondary">
              {match.requirements.met.length} of {match.requirements.met.length + match.requirements.missing.length} sample
              requirements are in the passport.
            </ThemedText>
          </Card>
          {match.requirements.missing.length > 0 ? (
            <View style={styles.group}>
              <ThemedText type="smallBold">Still needed</ThemedText>
              {match.requirements.missing.map((item) => (
                <RequirementRow key={item.id} item={item} />
              ))}
            </View>
          ) : null}
          {match.requirements.met.length > 0 ? (
            <View style={styles.group}>
              <ThemedText type="smallBold">In the passport</ThemedText>
              {match.requirements.met.map((item) => (
                <RequirementRow key={item.id} item={item} />
              ))}
            </View>
          ) : null}
          <ThemedText type="caption" themeColor="textSecondary">
            {RESEARCH_NOTE} A potential match is not a loan decision.
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function RequirementRow({ item }: { item: RequirementCheck }) {
  return (
    <Card>
      <View style={styles.row}>
        <ThemedText type="smallBold">{item.label}</ThemedText>
        <Badge label={item.met ? 'In passport' : 'Still needed'} variant={item.met ? 'success' : 'warning'} />
      </View>
      <ThemedText type="caption" themeColor="textSecondary">
        {item.researchTag} · {item.reliability}
      </ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {item.source}
      </ThemedText>
      {item.met ? null : (
        <Button title="Add to passport" variant="secondary" onPress={() => router.push(sectionHref(item.section))} />
      )}
    </Card>
  );
}

function strengthVariant(strength: FitStrength): 'primary' | 'info' | 'neutral' {
  if (strength === 'closer') return 'primary';
  if (strength === 'possible') return 'info';
  return 'neutral';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  group: { gap: Spacing.two },
});
