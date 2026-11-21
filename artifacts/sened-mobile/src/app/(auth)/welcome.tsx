import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useDocuments } from '@/context/document-context';
import { useI18n } from '@/context/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { generateDocument } from '@/lib/api';
import { ApiError } from '@/lib/contracts';
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD, demoPassport, ensureBackupAccount } from '@/lib/demo-business';
import { copy } from '@/lib/i18n';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { t, setLanguage } = useI18n();
  const { register, login, user } = useAuth();
  const { status: businessStatus, activeBusiness, saveSections } = useBusiness();
  const { status: documentStatus, documents, remember } = useDocuments();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    if (!pending.current || user?.email !== DEMO_EMAIL) return;
    if (businessStatus !== 'ready' || documentStatus !== 'ready') return;
    pending.current = false;
    const businessId = activeBusiness?.id ?? null;
    const hasDocument = documents.length > 0;

    void (async () => {
      try {
        const passport = demoPassport();
        const id = businessId ?? (await saveSections(passport));
        if (!hasDocument) {
          const saved = await generateDocument({
            docType: 'LOAN_REQUEST_LETTER',
            language: 'AM',
            businessId: id,
            passport,
          });
          await remember(saved);
        }
        router.dismissTo('/');
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : t(copy.welcome.demoError));
      } finally {
        setBusy(false);
      }
    })();
  }, [user, businessStatus, documentStatus, activeBusiness, documents, saveSections, remember, t]);

  async function onDemo() {
    if (busy) return;
    setBusy(true);
    setError(null);
    pending.current = true;
    try {
      await setLanguage('EN');
      await ensureBackupAccount();
      try {
        await register({ email: DEMO_EMAIL, password: DEMO_PASSWORD, fullName: DEMO_NAME });
      } catch (caught) {
        if (!(caught instanceof ApiError) || caught.status !== 409) throw caught;
        await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      }
    } catch (caught) {
      pending.current = false;
      setBusy(false);
      setError(caught instanceof ApiError ? caught.message : t(copy.welcome.demoError));
    }
  }

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
        <Button title={t(copy.welcome.demo)} loading={busy} onPress={() => void onDemo()} />
        <ThemedText type="caption" themeColor="textSecondary" style={styles.centered}>
          {t(copy.welcome.demoHint)}
        </ThemedText>
        {error ? (
          <ThemedText type="small" themeColor="danger" style={styles.centered}>
            {error}
          </ThemedText>
        ) : null}
        <Button title={t(copy.welcome.createAccount)} variant="secondary" onPress={() => router.push('/register')} />
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
