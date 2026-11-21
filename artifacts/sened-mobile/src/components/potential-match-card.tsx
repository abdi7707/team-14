import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatAmountRange, strengthLabel } from '@/lib/matching';
import type { FitStrength, PotentialMatch } from '@/types/financing';

export function PotentialMatchCard({ match }: { match: PotentialMatch }) {
  const missing = match.requirements.missing.length;
  return (
    <Card onPress={() => router.push({ pathname: '/product', params: { id: match.product.id } })}>
      <View style={styles.row}>
        <ThemedText type="smallBold">{match.institution.shortName}</ThemedText>
        <Badge label={strengthLabel(match.fit.strength)} variant={strengthVariant(match.fit.strength)} />
      </View>
      <ThemedText type="defaultSemiBold">{match.product.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatAmountRange(match.product)}
      </ThemedText>
      <ThemedText type="small">
        Fit {match.fit.score} · {match.readiness}% preparation readiness
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {missing === 0
          ? 'No missing sample requirements'
          : missing === 1
            ? '1 sample requirement still needed'
            : `${missing} sample requirements still needed`}
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
    gap: Spacing.two,
  },
});
