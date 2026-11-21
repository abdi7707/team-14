import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

import { uploadsKey } from '@/lib/storage-keys';
import { UPLOAD_KINDS, type StoredUpload, type UploadKind } from '@/types/upload';

const MAX_BYTES = 15 * 1024 * 1024;

export async function loadUploads(userId: string): Promise<StoredUpload[]> {
  try {
    const raw = await AsyncStorage.getItem(uploadsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredUpload);
  } catch {
    return [];
  }
}

export async function saveUploads(userId: string, uploads: StoredUpload[]): Promise<void> {
  await AsyncStorage.setItem(uploadsKey(userId), JSON.stringify(uploads));
}

export async function pickUploadFile(): Promise<
  { ok: true; file: Pick<StoredUpload, 'fileName' | 'mimeType' | 'size'> } | { ok: false; reason: 'cancel' | 'tooLarge' | 'failed' }
> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: false,
      multiple: false,
      base64: false,
    });
    if (result.canceled) return { ok: false, reason: 'cancel' };
    const asset = result.assets[0];
    if (!asset?.name) return { ok: false, reason: 'failed' };
    const size = typeof asset.size === 'number' ? asset.size : 0;
    if (size > MAX_BYTES) return { ok: false, reason: 'tooLarge' };
    return {
      ok: true,
      file: {
        fileName: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size,
      },
    };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

function isStoredUpload(value: unknown): value is StoredUpload {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return (
    isUploadKind(body.kind) &&
    typeof body.fileName === 'string' &&
    body.fileName.trim().length > 0 &&
    typeof body.mimeType === 'string' &&
    typeof body.size === 'number' &&
    typeof body.addedAt === 'string'
  );
}

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === 'string' && (UPLOAD_KINDS as readonly string[]).includes(value);
}
