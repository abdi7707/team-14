import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Button, Card } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/context/i18n-context';
import { copy, type Phrase } from '@/lib/i18n';
import { loadUploads, pickUploadFile, saveUploads } from '@/lib/uploads';
import { UPLOAD_KINDS, type StoredUpload, type UploadKind } from '@/types/upload';

const DETAILS: Record<UploadKind, { title: Phrase; hint: Phrase }> = {
  TRADE_LICENSE: { title: copy.documents.tradeLicense, hint: copy.documents.tradeLicenseHint },
  TIN_CERTIFICATE: { title: copy.documents.tinCertificate, hint: copy.documents.tinCertificateHint },
  BANK_STATEMENT: { title: copy.documents.bankStatement, hint: copy.documents.bankStatementHint },
  NATIONAL_ID: { title: copy.documents.nationalId, hint: copy.documents.nationalIdHint },
};

export function NecessaryDocuments() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [uploads, setUploads] = useState<StoredUpload[]>([]);
  const [busyKind, setBusyKind] = useState<UploadKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUploads([]);
      return;
    }
    let cancelled = false;
    void loadUploads(user.id).then((stored) => {
      if (!cancelled) setUploads(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onUpload(kind: UploadKind) {
    if (!user || busyKind) return;
    setBusyKind(kind);
    setError(null);
    const picked = await pickUploadFile();
    if (!picked.ok) {
      if (picked.reason === 'tooLarge') setError(t(copy.documents.tooLarge));
      if (picked.reason === 'failed') setError(t(copy.documents.uploadFailed));
      setBusyKind(null);
      return;
    }
    const next = [
      {
        kind,
        fileName: picked.file.fileName,
        mimeType: picked.file.mimeType,
        size: picked.file.size,
        addedAt: new Date().toISOString(),
      },
      ...uploads.filter((item) => item.kind !== kind),
    ];
    try {
      await saveUploads(user.id, next);
      setUploads(next);
    } catch {
      setError(t(copy.documents.uploadFailed));
    } finally {
      setBusyKind(null);
    }
  }

  async function onRemove(kind: UploadKind) {
    if (!user || busyKind) return;
    const next = uploads.filter((item) => item.kind !== kind);
    setUploads(next);
    setError(null);
    try {
      await saveUploads(user.id, next);
    } catch {
      setError(t(copy.documents.uploadFailed));
    }
  }

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{t(copy.documents.uploadsTitle)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t(copy.documents.uploadsIntro)}
      </ThemedText>
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
      {UPLOAD_KINDS.map((kind) => {
        const saved = uploads.find((item) => item.kind === kind);
        const details = DETAILS[kind];
        return (
          <Card key={kind}>
            <View style={styles.row}>
              <ThemedText type="smallBold" style={styles.grow}>
                {t(details.title)}
              </ThemedText>
              <Badge
                label={saved ? t(copy.documents.added) : t(copy.documents.needed)}
                variant={saved ? 'success' : 'warning'}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {t(details.hint)}
            </ThemedText>
            {saved ? (
              <ThemedText type="small">
                {saved.fileName}
                {saved.size > 0 ? ` · ${formatSize(saved.size)}` : ''}
              </ThemedText>
            ) : null}
            <View style={styles.actions}>
              <Button
                title={saved ? t(copy.documents.replace) : t(copy.documents.upload)}
                size="sm"
                variant={saved ? 'outline' : 'secondary'}
                loading={busyKind === kind}
                onPress={() => void onUpload(kind)}
              />
              {saved ? (
                <Button
                  title={t(copy.documents.remove)}
                  size="sm"
                  variant="ghost"
                  disabled={busyKind !== null}
                  onPress={() => void onRemove(kind)}
                />
              ) : null}
            </View>
          </Card>
        );
      })}
    </View>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  grow: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
