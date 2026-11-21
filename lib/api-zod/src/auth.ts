import { z } from "zod";
import { Language } from "./language";

// Keep these rules and messages in sync with artifacts/sened-mobile/src/lib/validation.ts.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Email = z
  .string({ error: "Enter your email." })
  .trim()
  .toLowerCase()
  .min(1, "Enter your email.")
  .regex(EMAIL_PATTERN, "Enter a valid email address.");

export const RegisterBody = z.object({
  email: Email,
  password: z
    .string({ error: "Enter a password." })
    .min(8, "Use at least 8 characters.")
    .max(72, "Use at most 72 characters."),
  fullName: z
    .string({ error: "Enter your full name." })
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use at most 80 characters."),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const LoginBody = z.object({
  email: Email,
  password: z
    .string({ error: "Enter a password." })
    .min(1, "Enter a password.")
    .max(72, "Use at most 72 characters."),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const USER_ROLES = ["user", "admin"] as const;
export const UserRole = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRole>;

export const User = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  role: UserRole,
  preferredLanguage: Language,
});
export type User = z.infer<typeof User>;

/** Response of POST /auth/register and POST /auth/login. */
export const AuthResponse = z.object({
  token: z.string(),
  user: User,
});
export type AuthResponse = z.infer<typeof AuthResponse>;

/** Response of GET /auth/me. */
export const MeResponse = z.object({
  user: User,
});
export type MeResponse = z.infer<typeof MeResponse>;
