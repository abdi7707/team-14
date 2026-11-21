import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useDocuments } from '@/context/document-context';
import { ApiError, type Language } from '@/lib/contracts';
import { generateDocument, isMockApi } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';
import { DOCUMENT_CHOICES, LANGUAGE_CHOICES, type DocType } from '@/types/document';

export default function SelectDocumentScreen() {
  const theme = useTheme();
  const { status: authStatus, user } = useAuth();
  const { status, activeBusiness } = useBusiness();
  const { remember } = useDocuments();
  const [docType, setDocType] = useState<DocType>('LOAN_REQUEST_LETTER');
  const [language, setLanguage] = useState<Language>('EN');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const businessName = activeBusiness?.passport.identity.businessName.trim() ?? '';

  async function onGenerate() {
    if (!activeBusiness || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const saved = await generateDocument({
        docType,
        language,
        businessId: activeBusiness.id,
        passport: activeBusiness.passport,
      });
      await remember(saved);
      router.push({ pathname: '/preview', params: { id: saved.id } });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not generate the document.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'Create a document' }} />
      {loading ? (
        <LoadingNote message="Checking your passport…" />
      ) : !user ? (
        <SignInPrompt
          title="Sign in to create a document"
          message="A loan request letter is saved to your account."
        />
      ) : !activeBusiness ? (
        <EmptyState
          icon={{ ios: 'doc.text.fill', android: 'description', web: 'description' }}
          title="Add your business first"
          message="The letter is written from your Business Passport."
          actionLabel="Add business basics"
          onAction={() => router.push('/business-basics')}
        />
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {businessName || 'Untitled business'}
          </ThemedText>
          <View style={styles.group}>
            <ThemedText type="smallBold">Document</ThemedText>
            {DOCUMENT_CHOICES.map((choice) => (
              <Choice
                key={choice.id}
                label={choice.title}
                detail={choice.description}
                selected={docType === choice.id}
                onPress={() => setDocType(choice.id)}
                borderColor={theme.border}
                selectedColor={theme.primary}
              />
            ))}
          </View>
          <View style={styles.group}>
            <ThemedText type="smallBold">Language</ThemedText>
            {LANGUAGE_CHOICES.map((choice) => (
              <Choice
                key={choice.id}
                label={choice.label}
                selected={language === choice.id}
                onPress={() => setLanguage(choice.id)}
                borderColor={theme.border}
                selectedColor={theme.primary}
              />
            ))}
          </View>
          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}
          <Button title="Generate Loan Request Letter" loading={submitting} onPress={() => void onGenerate()} />
          <ThemedText type="small" themeColor="textSecondary">
            Empty passport fields appear as [to be confirmed].
            {isMockApi()
              ? ' This practice draft uses only what you entered. The API writes the full letter.'
              : ''}
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function Choice({
  label,
  detail,
  selected,
  onPress,
  borderColor,
  selectedColor,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  borderColor: string;
  selectedColor: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, { borderColor: selected ? selectedColor : borderColor }]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {detail ? (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  choice: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
