import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ApiError, type LoginBody, type RegisterBody, type User } from '@/lib/contracts';
import { login as loginRequest, me, register as registerRequest, setAuthToken } from '@/lib/api';
import { StorageKeys } from '@/lib/storage-keys';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  register: (body: RegisterBody) => Promise<void>;
  login: (body: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const signedOut = { status: 'signedOut' as const, user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthStatus; user: User | null }>({
    status: 'loading',
    user: null,
  });
  const epoch = useRef(0);

  useEffect(() => {
    const current = ++epoch.current;

    async function restore() {
      try {
        const stored = await AsyncStorage.multiGet([StorageKeys.authToken, StorageKeys.user]);
        if (epoch.current !== current) return;
        const token = stored[0]?.[1] ?? null;
        const user = parseStoredUser(stored[1]?.[1] ?? null);
        if (!token || !user) {
          await clearSessionIfUnchanged(token);
          if (epoch.current === current) setState(signedOut);
          return;
        }

        setAuthToken(token);
        try {
          const fresh = await me();
          if (epoch.current !== current) return;
          await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(fresh));
          if (epoch.current === current) setState({ status: 'signedIn', user: fresh });
        } catch (error) {
          if (epoch.current !== current) return;
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            await clearSessionIfUnchanged(token);
            if (epoch.current === current) setState(signedOut);
            return;
          }
          setState({ status: 'signedIn', user });
        }
      } catch {
        if (epoch.current !== current) return;
        await clearSession();
        if (epoch.current === current) setState(signedOut);
      }
    }

    void restore();
  }, []);

  const register = useCallback(async (body: RegisterBody) => {
    const current = ++epoch.current;
    const session = await registerRequest(body);
    await persistSession(session.token, session.user);
    if (epoch.current === current) setState({ status: 'signedIn', user: session.user });
  }, []);

  const login = useCallback(async (body: LoginBody) => {
    const current = ++epoch.current;
    const session = await loginRequest(body);
    await persistSession(session.token, session.user);
    if (epoch.current === current) setState({ status: 'signedIn', user: session.user });
  }, []);

  const logout = useCallback(async () => {
    const current = ++epoch.current;
    await clearSession();
    if (epoch.current === current) setState(signedOut);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status: state.status, user: state.user, register, login, logout }),
    [state.status, state.user, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

async function persistSession(token: string, user: User) {
  setAuthToken(token);
  await AsyncStorage.multiSet([
    [StorageKeys.authToken, token],
    [StorageKeys.user, JSON.stringify(user)],
  ]);
}

async function clearSession() {
  setAuthToken(null);
  await AsyncStorage.multiRemove([StorageKeys.authToken, StorageKeys.user]);
}

async function clearSessionIfUnchanged(expectedToken: string | null) {
  const stored = await AsyncStorage.getItem(StorageKeys.authToken);
  if (stored !== expectedToken) return;
  await clearSession();
}

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const user = value as Partial<User>;
    if (typeof user.id !== 'string' || typeof user.email !== 'string' || typeof user.fullName !== 'string') {
      return null;
    }
    if (user.role !== 'user' && user.role !== 'admin') return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: typeof user.phone === 'string' ? user.phone : null,
      role: user.role,
      preferredLanguage: user.preferredLanguage === 'AM' || user.preferredLanguage === 'OM' ? user.preferredLanguage : 'EN',
    };
  } catch {
    return null;
  }
}
