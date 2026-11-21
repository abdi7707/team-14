import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/document-context';
import { languageLabel } from '@/types/document';

export default function DocumentsScreen() {
  const { status: authStatus, user } = useAuth();
  const { status, documents } = useDocuments();
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');

  return (
    <Screen>
      <ScreenHeader title="Documents" subtitle="Professional drafts generated from your Business Passport." />
      {loading ? (
        <LoadingNote message="Checking your documents…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to see your documents"
          message="Generate a loan request letter in English, Amharic, or Afaan Oromoo."
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
          title="No documents yet"
          message="Generate a loan request letter in English, Amharic, or Afaan Oromoo."
          actionLabel="Generate Loan Request Letter"
          onAction={() => router.push('/select')}
        />
      ) : (
        <>
          <Button title="Generate Loan Request Letter" onPress={() => router.push('/select')} />
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
