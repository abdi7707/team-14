/**
 * Mobile copy of the Task 2 auth contract. CamelCase JSON.
 * Move these types to lib/api-zod when the workspace exists — do not keep a second shape.
 *
 * RegisterBody: { email, password, fullName }
 * LoginBody: { email, password }
 * AuthResponse: { token, user }
 * User: { id, email, fullName, phone, role, preferredLanguage }
 * Error body: { message } (a string `error` field is also accepted)
 */

export type Language = 'EN' | 'AM' | 'OM';
export type UserRole = 'user' | 'admin';

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  preferredLanguage: Language;
};

export type RegisterBody = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
