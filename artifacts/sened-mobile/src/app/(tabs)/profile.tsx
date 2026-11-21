import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function ProfileScreen() {
  const { status, user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function onLogout() {
    setSigningOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch {
      setLogoutError('Could not log out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" />

      {status === 'loading' ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            Checking your account…
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
          <Button title="Log out" variant="outline" loading={signingOut} onPress={() => void onLogout()} />
        </Card>
      ) : (
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
      )}

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
