import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <Screen>
      <ScreenHeader title="Profile" />

      <Card>
        <ThemedText type="defaultSemiBold">You are not signed in</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Sign in to generate documents and keep your account safe.
        </ThemedText>
        <View style={styles.actions}>
          <Button title="Log in" onPress={() => router.push('/login')} />
          <Button title="Create account" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      </Card>

      <Card>
        <ThemedText type="defaultSemiBold">Language</ThemedText>
        <View style={styles.badges}>
          <Badge label="English" variant="primary" />
          <Badge label="አማርኛ" />
          <Badge label="Afaan Oromoo" />
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          Language switching arrives with the multilingual update.
        </ThemedText>
      </Card>

      <Button title="View welcome screen" variant="ghost" onPress={() => router.push('/welcome')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
