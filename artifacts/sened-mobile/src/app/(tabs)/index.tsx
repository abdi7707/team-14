import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ProgressBar, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <ScreenHeader title="SENED AI" subtitle="Prepare your business for financing." />

      <Card>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Business Passport</ThemedText>
          <Badge label="Not started" />
        </View>
        <ProgressBar value={0} accessibilityLabel="Business Passport completeness" />
        <ThemedText type="small" themeColor="textSecondary">
          0% complete
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="caption" themeColor="textSecondary">
          NEXT BEST ACTION
        </ThemedText>
        <ThemedText type="defaultSemiBold">Add your business basics</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Your name, sector, and location are the first step toward potential financing matches.
        </ThemedText>
        <Button title="Start your passport" onPress={() => router.push('/business-basics')} />
      </Card>
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
