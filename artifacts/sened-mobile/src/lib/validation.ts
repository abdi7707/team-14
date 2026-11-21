const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function emailError(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Enter your email.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return null;
}

export function passwordError(value: string): string | null {
  if (!value) return 'Enter a password.';
  if (value.length < 8) return 'Use at least 8 characters.';
  if (value.length > 72) return 'Use at most 72 characters.';
  return null;
}

export function fullNameError(value: string): string | null {
  const name = value.trim();
  if (name.length < 2) return 'Enter your full name.';
  if (name.length > 80) return 'Use at most 80 characters.';
  return null;
}
