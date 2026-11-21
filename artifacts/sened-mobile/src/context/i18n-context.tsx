import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Language } from '@/lib/contracts';
import { isLanguage, translate, type Phrase } from '@/lib/i18n';
import { StorageKeys } from '@/lib/storage-keys';

type I18nContextValue = {
  language: Language;
  ready: boolean;
  setLanguage: (language: Language) => Promise<void>;
  t: (phrase: Phrase) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const stored = await AsyncStorage.getItem(StorageKeys.language);
        if (!cancelled && isLanguage(stored)) setLanguageState(stored);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    setLanguageState(next);
    await AsyncStorage.setItem(StorageKeys.language, next);
  }, []);

  const t = useCallback((phrase: Phrase) => translate(language, phrase), [language]);

  const value = useMemo(() => ({ language, ready, setLanguage, t }), [language, ready, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}
