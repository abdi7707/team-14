import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/context/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { copy } from '@/lib/i18n';
import { LANGUAGE_CHOICES } from '@/types/document';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t, language, setLanguage } = useI18n();
  const { status, user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function onLogout() {
    setSigningOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch {
      setLogoutError(t(copy.profile.logoutError));
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title={t(copy.profile.title)} />

      {status === 'loading' ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            {t(copy.profile.checking)}
          </ThemedText>
        </Card>
      ) : status === 'signedIn' && user ? (
        <Card>
          <ThemedText type="defaultSemiBold">{user.fullName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.email}
          </ThemedText>
          {user.role === 'admin' ? <Badge label="Admin" variant="info" /> : null}
          {logoutError ? (
            <ThemedText type="small" themeColor="danger">
              {logoutError}
            </ThemedText>
          ) : null}
          <Button title={t(copy.profile.logOut)} variant="outline" loading={signingOut} onPress={() => void onLogout()} />
        </Card>
      ) : (
        <Card>
          <ThemedText type="defaultSemiBold">{t(copy.profile.signedOutTitle)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t(copy.profile.signedOutMessage)}
          </ThemedText>
          <View style={styles.actions}>
            <Button title={t(copy.profile.logIn)} onPress={() => router.push('/login')} />
            <Button title={t(copy.profile.createAccount)} variant="secondary" onPress={() => router.push('/register')} />
          </View>
        </Card>
      )}

      <Card>
        <ThemedText type="defaultSemiBold">{t(copy.profile.language)}</ThemedText>
        <View style={styles.languages}>
          {LANGUAGE_CHOICES.map((choice) => {
            const selected = language === choice.id;
            return (
              <Pressable
                key={choice.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => void setLanguage(choice.id)}
                style={[styles.language, { borderColor: selected ? theme.primary : theme.border }]}>
                <ThemedText type="smallBold">{choice.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          {t(copy.profile.languageHint)}
        </ThemedText>
      </Card>

      <Button title={t(copy.profile.welcome)} variant="ghost" onPress={() => router.push('/welcome')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.two,
  },
  languages: {
    gap: Spacing.two,
  },
  language: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
});
