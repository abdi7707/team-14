import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiError, type AuthResponse, type LoginBody, type RegisterBody, type User } from '@/lib/contracts';
import { emailError, fullNameError, normalizeEmail, passwordError } from '@/lib/validation';

const MOCK_ACCOUNTS_KEY = '@sened:mock_accounts';

type MockAccount = {
  user: User;
  password: string;
  token: string;
};

let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

/** Server origin with no trailing slash and no `/api` suffix. Null means practice mode. */
export function apiOrigin(): string | null {
  const raw = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  return withProtocol.replace(/\/+$/, '').replace(/\/api$/i, '');
}

export function isMockApi(): boolean {
  return apiOrigin() === null;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const email = normalizeEmail(body.email);
  const fullName = body.fullName.trim();
  const invalid = emailError(email) ?? passwordError(body.password) ?? fullNameError(fullName);
  if (invalid) throw new ApiError(400, invalid);

  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: { email, password: body.password, fullName },
  });
  return parseAuthResponse(payload);
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const email = normalizeEmail(body.email);
  const invalid = emailError(email) ?? passwordError(body.password);
  if (invalid) throw new ApiError(400, invalid);

  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password: body.password },
  });
  return parseAuthResponse(payload);
}

export async function me(): Promise<User> {
  const payload = await request('/api/auth/me', { method: 'GET', auth: true });
  return parseMe(payload);
}

type RequestOptions = {
  method: 'GET' | 'POST';
  body?: unknown;
  auth?: boolean;
};

async function request(path: string, options: RequestOptions): Promise<unknown> {
  const origin = apiOrigin();
  if (!origin) return mockRequest(path, options);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth) {
    if (!currentToken) throw new ApiError(401, 'You are not signed in.');
    headers.Authorization = `Bearer ${currentToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${origin}${path}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the SENED API. Check your connection and try again.');
  }

  const text = await response.text();
  const payload = text ? parseJson(text) : null;
  if (!response.ok) throw new ApiError(response.status, messageFromPayload(payload, response.status));
  return payload;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(500, 'The server returned an unexpected response.');
  }
}

function messageFromPayload(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
  }
  if (status === 401) return 'Email or password is incorrect.';
  if (status === 409) return 'An account with this email already exists.';
  return 'Something went wrong. Please try again.';
}

function parseAuthResponse(value: unknown): AuthResponse {
  if (!value || typeof value !== 'object') {
    throw new ApiError(500, 'The server returned an unexpected response.');
  }
  const body = value as Record<string, unknown>;
  if (typeof body.token !== 'string' || body.token.length === 0) {
    throw new ApiError(500, 'The server returned an unexpected response.');
  }
  return { token: body.token, user: parseUser(body.user) };
}

function parseMe(value: unknown): User {
  if (value && typeof value === 'object' && 'user' in value && !('email' in value)) {
    return parseUser((value as { user: unknown }).user);
  }
  return parseUser(value);
}

function parseUser(value: unknown): User {
  if (!value || typeof value !== 'object') {
    throw new ApiError(500, 'The server returned an unexpected account.');
  }
  const raw = value as Record<string, unknown>;
  const fullName = raw.fullName ?? raw.full_name;
  const language = raw.preferredLanguage ?? raw.preferred_language;
  const role = raw.role === 'admin' ? 'admin' : raw.role === 'user' ? 'user' : null;
  if (typeof raw.id !== 'string' || typeof raw.email !== 'string' || typeof fullName !== 'string' || !role) {
    throw new ApiError(500, 'The server returned an unexpected account.');
  }
  const preferredLanguage = language === 'AM' || language === 'OM' || language === 'EN' ? language : 'EN';
  return {
    id: raw.id,
    email: raw.email,
    fullName,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    role,
    preferredLanguage,
  };
}

async function mockRequest(path: string, options: RequestOptions): Promise<unknown> {
  await delay(250);
  if (path === '/api/auth/register' && options.method === 'POST') return mockRegister(options.body);
  if (path === '/api/auth/login' && options.method === 'POST') return mockLogin(options.body);
  if (path === '/api/auth/me' && options.method === 'GET') return mockMe();
  throw new ApiError(404, 'This action is not available yet.');
}

async function mockRegister(body: unknown): Promise<AuthResponse> {
  const { email, password, fullName } = body as RegisterBody;
  const accounts = await readMockAccounts();
  if (accounts.some((account) => account.user.email === email)) {
    throw new ApiError(409, 'An account with this email already exists.');
  }
  const account: MockAccount = {
    user: {
      id: createId(),
      email,
      fullName,
      phone: null,
      role: 'user',
      preferredLanguage: 'EN',
    },
    password,
    token: '',
  };
  account.token = `mock.${account.user.id}`;
  accounts.push(account);
  await writeMockAccounts(accounts);
  return { token: account.token, user: account.user };
}

async function mockLogin(body: unknown): Promise<AuthResponse> {
  const { email, password } = body as LoginBody;
  const accounts = await readMockAccounts();
  const account = accounts.find((item) => item.user.email === email);
  if (!account || account.password !== password) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }
  account.token = `mock.${account.user.id}`;
  await writeMockAccounts(accounts);
  return { token: account.token, user: account.user };
}

async function mockMe(): Promise<User> {
  if (!currentToken) throw new ApiError(401, 'You are not signed in.');
  const accounts = await readMockAccounts();
  const account = accounts.find((item) => item.token === currentToken);
  if (!account) throw new ApiError(401, 'You are not signed in.');
  return account.user;
}

async function readMockAccounts(): Promise<MockAccount[]> {
  const raw = await AsyncStorage.getItem(MOCK_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMockAccount);
  } catch {
    return [];
  }
}

function isMockAccount(value: unknown): value is MockAccount {
  if (!value || typeof value !== 'object') return false;
  const account = value as Partial<MockAccount>;
  return (
    typeof account.password === 'string' &&
    typeof account.token === 'string' &&
    !!account.user &&
    typeof account.user.email === 'string'
  );
}

async function writeMockAccounts(accounts: MockAccount[]) {
  await AsyncStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUUID) return randomUUID();
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
