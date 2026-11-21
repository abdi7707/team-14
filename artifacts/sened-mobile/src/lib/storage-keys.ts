export const StorageKeys = {
  authToken: '@sened:auth_token',
  user: '@sened:user',
  language: '@sened:language',
} as const;

export function businessesKey(userId: string): string {
  return `@sened:businesses:${userId}`;
}

export function activeBusinessKey(userId: string): string {
  return `@sened:active_business:${userId}`;
}

export function documentsKey(userId: string): string {
  return `@sened:docs:${userId}`;
}

export function uploadsKey(userId: string): string {
  return `@sened:uploads:${userId}`;
}
