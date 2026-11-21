import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/context/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { copy } from '@/lib/i18n';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <Screen edges={['top', 'bottom']} scroll={false}>
      <Stack.Screen options={{ headerShown: false, title: 'Welcome' }} />

      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <ThemedText type="title" themeColor="textOnPrimary">
            S
          </ThemedText>
        </View>
        <ThemedText type="title" style={styles.centered}>
          SENED AI
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centered}>
          {t(copy.welcome.subtitle)}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Button title={t(copy.welcome.createAccount)} onPress={() => router.push('/register')} />
        <Button title={t(copy.welcome.logIn)} variant="outline" onPress={() => router.push('/login')} />
        <Button title={t(copy.welcome.skip)} variant="ghost" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
});
