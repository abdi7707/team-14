import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/context/i18n-context';
import { copy, fill, strengthPhrase } from '@/lib/i18n';
import { formatAmountRange } from '@/lib/matching';
import type { FitStrength, PotentialMatch } from '@/types/financing';

export function PotentialMatchCard({ match }: { match: PotentialMatch }) {
  const { t } = useI18n();
  const missing = match.requirements.missing.length;
  const missingLabel =
    missing === 0
      ? t(copy.financing.missingNone)
      : missing === 1
        ? t(copy.financing.missingOne)
        : fill(t(copy.financing.missingMany), { count: missing });
  return (
    <Card onPress={() => router.push({ pathname: '/product', params: { id: match.product.id } })}>
      <View style={styles.row}>
        <ThemedText type="smallBold">{match.institution.shortName}</ThemedText>
        <Badge label={t(strengthPhrase(match.fit.strength))} variant={strengthVariant(match.fit.strength)} />
      </View>
      <ThemedText type="defaultSemiBold">{match.product.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatAmountRange(match.product)}
      </ThemedText>
      <ThemedText type="small">
        {fill(t(copy.financing.fitLine), { score: match.fit.score, percent: match.readiness })}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {missingLabel}
      </ThemedText>
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
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
