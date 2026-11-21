import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/document-context';
import { ApiError } from '@/lib/contracts';
import { fetchDocumentPdf } from '@/lib/api';
import { documentHtml } from '@/lib/draft-document';
import { savePdf } from '@/lib/save-pdf';
import { languageLabel } from '@/types/document';

export default function PreviewDocumentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const { status: authStatus, user } = useAuth();
  const { status, documents } = useDocuments();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const document = documents.find((item) => item.id === documentId) ?? null;

  async function onSave() {
    if (!document || saving) return;
    setSaving(true);
    setError(null);
    const filename = `sened-loan-request-${document.language}.pdf`;
    try {
      if (document.source === 'api') {
        const bytes = await fetchDocumentPdf(document.id);
        await savePdf({ filename, bytes });
      } else {
        await savePdf({ filename, html: documentHtml(document.content.title, document.content.sections) });
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not save the PDF. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Draft' }} />
      {loading ? (
        <LoadingNote message="Opening your document…" />
      ) : !user ? (
        <SignInPrompt title="Sign in to see this document" message="Documents stay with the account that created them." />
      ) : !document ? (
        <EmptyState
          icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
          title="Document not available"
          message="This draft is not saved on this account."
        />
      ) : (
        <>
          <View style={styles.meta}>
            <Badge label="Draft" variant="warning" />
            <Badge label={languageLabel(document.language)} variant="neutral" />
          </View>
          <ThemedText type="title">{document.content.title}</ThemedText>
          {document.content.sections.map((section) => (
            <Card key={section.heading}>
              <ThemedText type="smallBold">{section.heading}</ThemedText>
              <ThemedText>{section.body}</ThemedText>
            </Card>
          ))}
          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}
          <Button title="Save as PDF" loading={saving} onPress={() => void onSave()} />
          {document.source === 'practice' ? (
            <ThemedText type="small" themeColor="textSecondary">
              On web, choose Save as PDF in the print dialog. The letter uses only your passport.
            </ThemedText>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', gap: Spacing.two },
});
