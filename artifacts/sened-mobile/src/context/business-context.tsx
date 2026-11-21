import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { emptyPassport } from '@/lib/passport';
import { activeBusinessKey, businessesKey } from '@/lib/storage-keys';
import type {
  AmountPeriod,
  BusinessPassport,
  BusinessRecord,
  StructuredAmount,
} from '@/types/passport';

type BusinessStatus = 'loading' | 'ready';

type Snapshot = {
  userId: string | null;
  status: BusinessStatus;
  businesses: BusinessRecord[];
  activeId: string | null;
};

type BusinessContextValue = {
  status: BusinessStatus;
  businesses: BusinessRecord[];
  activeBusiness: BusinessRecord | null;
  saveSections: (patch: Partial<BusinessPassport>) => Promise<string>;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot>({
    userId: null,
    status: 'loading',
    businesses: [],
    activeId: null,
  });
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    if (authStatus === 'loading') return;
    const userId = user?.id ?? null;
    if (!userId) {
      setSnapshot({ userId: null, status: 'ready', businesses: [], activeId: null });
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const stored = await AsyncStorage.multiGet([businessesKey(userId!), activeBusinessKey(userId!)]);
        if (cancelled) return;
        const businesses = parseBusinesses(stored[0]?.[1] ?? null);
        const storedActive = stored[1]?.[1] ?? null;
        const activeId = businesses.some((business) => business.id === storedActive)
          ? storedActive
          : (businesses[0]?.id ?? null);
        setSnapshot({ userId, status: 'ready', businesses, activeId });
      } catch {
        if (!cancelled) setSnapshot({ userId, status: 'ready', businesses: [], activeId: null });
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
      return { status: 'loading' as const, businesses: [], activeId: null };
    }
    return snapshot;
  }, [authStatus, user?.id, snapshot]);

  const activeBusiness = visible.businesses.find((business) => business.id === visible.activeId) ?? null;

  const saveSections = useCallback(
    async (patch: Partial<BusinessPassport>) => {
      const userId = user?.id;
      if (!userId) throw new Error('Sign in to save your passport.');
      const current = snapshotRef.current;
      if (current.userId !== userId || current.status !== 'ready') {
        throw new Error('Your passport is still loading. Try again.');
      }

      const now = new Date().toISOString();
      const existing = current.businesses.find((business) => business.id === current.activeId) ?? null;
      let businesses: BusinessRecord[];
      let activeId: string;

      if (existing) {
        activeId = existing.id;
        const updated: BusinessRecord = {
          ...existing,
          updatedAt: now,
          passport: { ...existing.passport, ...patch },
        };
        businesses = current.businesses.map((business) => (business.id === existing.id ? updated : business));
      } else {
        activeId = createId();
        businesses = [
          ...current.businesses,
          {
            id: activeId,
            createdAt: now,
            updatedAt: now,
            passport: { ...emptyPassport(), ...patch },
          },
        ];
      }

      await AsyncStorage.multiSet([
        [businessesKey(userId), JSON.stringify(businesses)],
        [activeBusinessKey(userId), activeId],
      ]);
      const next = { userId, status: 'ready' as const, businesses, activeId };
      snapshotRef.current = next;
      setSnapshot(next);
      return activeId;
    },
    [user?.id],
  );

  const value = useMemo<BusinessContextValue>(
    () => ({
      status: visible.status,
      businesses: visible.businesses,
      activeBusiness,
      saveSections,
    }),
    [visible.status, visible.businesses, activeBusiness, saveSections],
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness(): BusinessContextValue {
  const value = useContext(BusinessContext);
  if (!value) throw new Error('useBusiness must be used inside BusinessProvider');
  return value;
}

function parseBusinesses(raw: string | null): BusinessRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const record = normalizeRecord(item);
      return record ? [record] : [];
    });
  } catch {
    return [];
  }
}

function normalizeRecord(value: unknown): BusinessRecord | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<BusinessRecord>;
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null;
  const base = emptyPassport();
  const stored = raw.passport && typeof raw.passport === 'object' ? raw.passport : undefined;
  const now = new Date().toISOString();
  return {
    id: raw.id,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    passport: {
      identity: { ...base.identity, ...stringFields(stored?.identity, base.identity) },
      location: { ...base.location, ...stringFields(stored?.location, base.location) },
      legal: { ...base.legal, ...stringFields(stored?.legal, base.legal) },
      operations: { ...base.operations, ...stringFields(stored?.operations, base.operations) },
      financial: {
        monthlyRevenue: sanitizeAmount(stored?.financial?.monthlyRevenue, 'monthly'),
        monthlyExpenses: sanitizeAmount(stored?.financial?.monthlyExpenses, 'monthly'),
        assets: sanitizeAmount(stored?.financial?.assets, 'total'),
      },
      financing: {
        amountNeeded: sanitizeAmount(stored?.financing?.amountNeeded, 'one-time'),
        purpose: textField(stored?.financing?.purpose),
        preferredTerm: textField(stored?.financing?.preferredTerm),
        collateral: textField(stored?.financing?.collateral),
      },
    },
  };
}

function stringFields<T extends Record<string, string>>(value: unknown, fallback: T): T {
  if (!value || typeof value !== 'object') return fallback;
  const source = value as Record<string, unknown>;
  const next = { ...fallback };
  for (const key of Object.keys(fallback)) {
    next[key as keyof T] = textField(source[key]) as T[keyof T];
  }
  return next;
}

function textField(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function sanitizeAmount(value: unknown, fallbackPeriod: AmountPeriod): StructuredAmount | null {
  if (!value || typeof value !== 'object') return null;
  const amount = value as Partial<StructuredAmount>;
  if (typeof amount.value !== 'number' || !Number.isFinite(amount.value) || amount.value < 0) return null;
  const period =
    amount.period === 'monthly' || amount.period === 'one-time' || amount.period === 'total'
      ? amount.period
      : fallbackPeriod;
  return {
    value: amount.value,
    currency: 'ETB',
    period,
    sourceType: 'owner_entered',
    confidence: amount.confidence === 'low' || amount.confidence === 'high' ? amount.confidence : 'medium',
    verified: amount.verified === true,
    updatedAt: typeof amount.updatedAt === 'string' ? amount.updatedAt : new Date().toISOString(),
  };
}

function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUUID) return randomUUID();
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
}
