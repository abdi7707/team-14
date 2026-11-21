import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LanguageDropdown } from '@/components/language-dropdown';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/context/i18n-context';
import { copy } from '@/lib/i18n';

export default function ProfileScreen() {
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
        <LanguageDropdown label={t(copy.profile.language)} value={language} onChange={(next) => void setLanguage(next)} />
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
});
