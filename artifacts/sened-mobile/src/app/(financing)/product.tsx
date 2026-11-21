import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ProgressBar } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useI18n } from '@/context/i18n-context';
import { copy, fill, strengthPhrase } from '@/lib/i18n';
import { formatAmountRange, runMatchingEngine, sectionHref } from '@/lib/matching';
import type { FitStrength, RequirementCheck } from '@/types/financing';

export default function ProductScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const passport = user ? activeBusiness?.passport : null;
  const match = passport ? runMatchingEngine(passport).find((item) => item.product.id === productId) : null;

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: t(copy.financing.matchTitle) }} />
      {loading ? (
        <LoadingNote message={t(copy.financing.checking)} />
      ) : !user ? (
        <SignInPrompt title={t(copy.financing.signInTitle)} message={t(copy.financing.signInMessage)} />
      ) : !match ? (
        <EmptyState
          icon={{ ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }}
          title="Product not available"
          message="This sample product is not in the registry, or the business passport is missing."
        />
      ) : (
        <>
          <View style={styles.row}>
            <Badge label={t(strengthPhrase(match.fit.strength))} variant={strengthVariant(match.fit.strength)} />
            <Badge
              label={t(match.institution.kind === 'bank' ? copy.financing.bank : copy.financing.microfinance)}
              variant="neutral"
            />
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
            <ThemedText type="smallBold">{fill(t(copy.financing.readiness), { percent: match.readiness })}</ThemedText>
            <ProgressBar value={match.readiness} accessibilityLabel="Preparation readiness" />
            <ThemedText type="small" themeColor="textSecondary">
              {match.requirements.met.length} of {match.requirements.met.length + match.requirements.missing.length} sample
              requirements are in the passport.
            </ThemedText>
          </Card>
          {match.requirements.missing.length > 0 ? (
            <View style={styles.group}>
              <ThemedText type="smallBold">{t(copy.financing.stillNeeded)}</ThemedText>
              {match.requirements.missing.map((item) => (
                <RequirementRow key={item.id} item={item} />
              ))}
            </View>
          ) : null}
          {match.requirements.met.length > 0 ? (
            <View style={styles.group}>
              <ThemedText type="smallBold">{t(copy.financing.inPassport)}</ThemedText>
              {match.requirements.met.map((item) => (
                <RequirementRow key={item.id} item={item} />
              ))}
            </View>
          ) : null}
          <ThemedText type="caption" themeColor="textSecondary">
            {t(copy.financing.researchNote)} {t(copy.financing.notADecision)}
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function RequirementRow({ item }: { item: RequirementCheck }) {
  const { t } = useI18n();
  return (
    <Card>
      <View style={styles.row}>
        <ThemedText type="smallBold">{item.label}</ThemedText>
        <Badge
          label={t(item.met ? copy.financing.inPassport : copy.financing.stillNeeded)}
          variant={item.met ? 'success' : 'warning'}
        />
      </View>
      <ThemedText type="caption" themeColor="textSecondary">
        {item.researchTag} · {item.reliability}
      </ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {item.source}
      </ThemedText>
      {item.met ? null : (
        <Button
          title={t(copy.financing.addToPassport)}
          variant="secondary"
          onPress={() => router.push(sectionHref(item.section))}
        />
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
