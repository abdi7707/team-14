import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { documentsKey } from '@/lib/storage-keys';
import type { Language } from '@/lib/contracts';
import type { SavedDocument } from '@/types/document';

type DocumentStatus = 'loading' | 'ready';

type Snapshot = {
  userId: string | null;
  status: DocumentStatus;
  documents: SavedDocument[];
};

type DocumentContextValue = {
  status: DocumentStatus;
  documents: SavedDocument[];
  remember: (document: SavedDocument) => Promise<void>;
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot>({ userId: null, status: 'loading', documents: [] });
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    if (authStatus === 'loading') return;
    const userId = user?.id ?? null;
    if (!userId) {
      setSnapshot({ userId: null, status: 'ready', documents: [] });
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const stored = await AsyncStorage.getItem(documentsKey(userId!));
        if (cancelled) return;
        setSnapshot({ userId, status: 'ready', documents: parseDocuments(stored) });
      } catch {
        if (!cancelled) setSnapshot({ userId, status: 'ready', documents: [] });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authStatus, user?.id]);

  const visible = useMemo(() => {
    const userId = authStatus === 'loading' ? undefined : (user?.id ?? null);
    if (userId === undefined || snapshot.userId !== userId || snapshot.status !== 'ready') {
      return { status: 'loading' as const, documents: [] as SavedDocument[] };
    }
    return snapshot;
  }, [authStatus, user?.id, snapshot]);

  const remember = useCallback(async (document: SavedDocument) => {
    const current = snapshotRef.current;
    const userId = user?.id;
    if (!userId || current.userId !== userId || current.status !== 'ready') {
      throw new Error('Sign in before saving a document.');
    }
    const documents = [document, ...current.documents.filter((item) => item.id !== document.id)];
    await AsyncStorage.setItem(documentsKey(userId), JSON.stringify(documents));
    const next = { userId, status: 'ready' as const, documents };
    snapshotRef.current = next;
    setSnapshot(next);
  }, [user?.id]);

  const value = useMemo(
    () => ({ status: visible.status, documents: visible.documents, remember }),
    [visible, remember],
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocuments() {
  const value = useContext(DocumentContext);
  if (!value) throw new Error('useDocuments must be used within DocumentProvider');
  return value;
}

function parseDocuments(raw: string | null): SavedDocument[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedDocument);
  } catch {
    return [];
  }
}

function isSavedDocument(value: unknown): value is SavedDocument {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  const content = body.content;
  if (!content || typeof content !== 'object') return false;
  const sections = (content as Record<string, unknown>).sections;
  return (
    typeof body.id === 'string' &&
    body.docType === 'LOAN_REQUEST_LETTER' &&
    isLanguage(body.language) &&
    (body.status === 'GENERATING' || body.status === 'READY' || body.status === 'FAILED') &&
    typeof (content as Record<string, unknown>).title === 'string' &&
    Array.isArray(sections) &&
    typeof body.businessId === 'string' &&
    typeof body.createdAt === 'string' &&
    (body.source === 'practice' || body.source === 'api')
  );
}

function isLanguage(value: unknown): value is Language {
  return value === 'EN' || value === 'AM' || value === 'OM';
}
