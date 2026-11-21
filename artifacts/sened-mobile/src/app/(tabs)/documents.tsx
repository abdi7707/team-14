import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/document-context';
import { useI18n } from '@/context/i18n-context';
import { copy } from '@/lib/i18n';
import { languageLabel } from '@/types/document';

export default function DocumentsScreen() {
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { status, documents } = useDocuments();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');

  return (
    <Screen>
      <ScreenHeader title={t(copy.tabs.documents)} subtitle={t(copy.documents.subtitle)} />
      {loading ? (
        <LoadingNote message={t(copy.documents.checking)} />
      ) : !user ? (
        <SignInPrompt title={t(copy.documents.signInTitle)} message={t(copy.documents.letterPrompt)} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
          title={t(copy.documents.emptyTitle)}
          message={t(copy.documents.letterPrompt)}
          actionLabel={t(copy.documents.generate)}
          onAction={() => router.push('/select')}
        />
      ) : (
        <>
          <Button title={t(copy.documents.generate)} onPress={() => router.push('/select')} />
          {documents.map((document) => (
            <Card key={document.id} onPress={() => router.push({ pathname: '/preview', params: { id: document.id } })}>
              <ThemedText type="smallBold">{document.content.title}</ThemedText>
              <View style={styles.meta}>
                <Badge label={languageLabel(document.language)} variant="neutral" />
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDate(document.createdAt)}
                </ThemedText>
              </View>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
