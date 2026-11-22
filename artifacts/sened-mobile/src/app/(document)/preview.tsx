import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingNote, SignInPrompt } from '@/components/sign-in-prompt';
import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBusiness } from '@/context/business-context';
import { useDocuments } from '@/context/document-context';
import { useI18n } from '@/context/i18n-context';
import { checkChapaPayment, generateDocument, startChapaCheckout } from '@/lib/api';
import { ApiError } from '@/lib/contracts';
import { copy, fill } from '@/lib/i18n';
import { documentFromHighlight, documentHtml, withSelectedDisclaimer } from '@/lib/draft-document';
import { savePdf } from '@/lib/save-pdf';
import { LOAN_LETTER_PRICE_ETB, isPaymentConfirmed, languageLabel, type SavedDocument } from '@/types/document';

export default function PreviewDocumentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const { t } = useI18n();
  const { status: authStatus, user } = useAuth();
  const { activeBusiness } = useBusiness();
  const { status, documents, remember } = useDocuments();
  const [saving, setSaving] = useState(false);
  const savedPayment = useRef<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = authStatus === 'loading' || (user !== null && status === 'loading');
  const document = documents.find((item) => item.id === documentId) ?? null;
  const sections = document ? withSelectedDisclaimer(document.language, document.content.sections) : [];
  const variant = document?.highlightVariant ?? 0;
  const fullDraft = document ? documentFromHighlight(sections, document.language, variant) : [];
  const paid = document ? isPaymentConfirmed(document) : false;
  const pending = document?.payment?.status === 'PENDING';
  const rejected = document?.payment?.status === 'REJECTED';

  async function downloadDraft(current: SavedDocument) {
    const letter = documentFromHighlight(
      withSelectedDisclaimer(current.language, current.content.sections),
      current.language,
      current.highlightVariant ?? 0,
    );
    await savePdf({
      filename: `sened-loan-request-${current.language}.pdf`,
      html: documentHtml(current.content.title, letter),
    });
  }

  async function onSave() {
    if (!document || !paid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await downloadDraft(document);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the PDF. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onRegenerate() {
    if (!document || !activeBusiness || regenerating || paid || pending) return;
    setRegenerating(true);
    setError(null);
    try {
      const saved = await generateDocument({
        docType: document.docType,
        language: document.language,
        businessId: activeBusiness.id,
        passport: activeBusiness.passport,
      });
      await remember({
        ...saved,
        id: document.id,
        businessId: document.businessId,
        createdAt: document.createdAt,
        paid: false,
        payment: undefined,
        highlightVariant: (document.highlightVariant ?? 0) + 1,
      });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not regenerate the document.');
    } finally {
      setRegenerating(false);
    }
  }

  async function applyChapaStatus(current: SavedDocument, txRef: string) {
    const result = await checkChapaPayment(txRef);
    const confirmed = result.status === 'CONFIRMED';
    await remember({
      ...current,
      paid: confirmed,
      payment: {
        transactionId: txRef,
        status: result.status,
        submittedAt: current.payment?.submittedAt ?? new Date().toISOString(),
        rejectionReason: result.status === 'REJECTED' ? 'chapa' : undefined,
      },
    });
    if (!confirmed || savedPayment.current === txRef) return;
    savedPayment.current = txRef;
    setSaving(true);
    setError(null);
    try {
      await downloadDraft(current);
    } catch (caught) {
      savedPayment.current = null;
      setError(caught instanceof Error ? caught.message : 'Could not save the PDF. Try again.');
    } finally {
      setSaving(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!document?.payment || document.payment.status !== 'PENDING' || paid || paying) return;
      void applyChapaStatus(document, document.payment.transactionId).catch((caught) => {
        setError(caught instanceof ApiError ? caught.message : 'Could not check the Chapa payment.');
      });
    }, [document?.id, document?.payment?.status, document?.payment?.transactionId, paid, paying]),
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      if (!document?.id || !event.url.includes(document.id)) return;
      if (!document.payment || document.payment.status !== 'PENDING' || paid) return;
      void applyChapaStatus(document, document.payment.transactionId).catch((caught) => {
        setError(caught instanceof ApiError ? caught.message : 'Could not check the Chapa payment.');
      });
    });
    return () => subscription.remove();
  }, [document?.id, document?.payment?.status, document?.payment?.transactionId, paid]);

  async function onPay() {
    if (!document || !user || paid || paying) return;
    setPaying(true);
    setError(null);
    try {
      const letter = documentFromHighlight(
        withSelectedDisclaimer(document.language, document.content.sections),
        document.language,
        document.highlightVariant ?? 0,
      );
      const appReturnUrl = Linking.createURL('/');
      const checkout = await startChapaCheckout({
        documentId: document.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        appReturnUrl,
        draftHtml: documentHtml(document.content.title, letter),
        filename: `sened-loan-request-${document.language}.pdf`,
      });
      const pendingDocument: SavedDocument = {
        ...document,
        paid: false,
        payment: { transactionId: checkout.txRef, status: 'PENDING', submittedAt: new Date().toISOString() },
      };
      await remember(pendingDocument);
      await Linking.openURL(checkout.checkoutUrl);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not start the Chapa payment.');
    } finally {
      setPaying(false);
    }
  }

  async function onCheckPayment() {
    if (!document?.payment || paid || paying) return;
    setPaying(true);
    setError(null);
    try {
      await applyChapaStatus(document, document.payment.transactionId);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not check the Chapa payment.');
    } finally {
      setPaying(false);
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
            <Badge
              label={
                paid
                  ? t(copy.documents.paid)
                  : pending
                    ? t(copy.documents.waiting)
                    : rejected
                      ? t(copy.documents.notConfirmed)
                      : t(copy.documents.highlight)
              }
              variant={paid ? 'success' : pending ? 'info' : 'warning'}
            />
          </View>
          <ThemedText type="title">{document.content.title}</ThemedText>
          {fullDraft.map((section, index) => (
            <Card key={`${section.heading}-${index}`}>
              <ThemedText type="smallBold">{section.heading}</ThemedText>
              <ThemedText>{section.body}</ThemedText>
            </Card>
          ))}
          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}
          {paid ? (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                {t(copy.documents.confirmedNote)}
              </ThemedText>
              <Button title={t(copy.documents.downloadAgain)} loading={saving} onPress={() => void onSave()} />
            </>
          ) : pending && document.payment ? (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                {t(copy.documents.waitingNote)}
              </ThemedText>
              <Button title={t(copy.documents.checkPayment)} loading={paying} onPress={() => void onCheckPayment()} />
            </>
          ) : (
            <>
              {rejected ? (
                <ThemedText type="small" themeColor="danger">
                  {t(copy.documents.rejectedNote)}
                </ThemedText>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  {t(copy.documents.highlightNote)}
                </ThemedText>
              )}
              <View style={styles.actions}>
                <Button
                  title={t(copy.documents.regenerate)}
                  variant="outline"
                  loading={regenerating}
                  onPress={() => void onRegenerate()}
                />
                <Button
                  title={fill(t(copy.documents.pay), { price: LOAN_LETTER_PRICE_ETB })}
                  loading={paying}
                  onPress={() => void onPay()}
                />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {fill(t(copy.documents.payNote), { price: LOAN_LETTER_PRICE_ETB })}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t(copy.documents.chapaTest)}
              </ThemedText>
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  actions: { gap: Spacing.two },
});
