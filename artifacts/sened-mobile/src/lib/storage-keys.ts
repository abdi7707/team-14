export const StorageKeys = {
  authToken: '@sened:auth_token',
  user: '@sened:user',
} as const;

export function businessesKey(userId: string): string {
  return `@sened:businesses:${userId}`;
}

export function activeBusinessKey(userId: string): string {
  return `@sened:active_business:${userId}`;
}
