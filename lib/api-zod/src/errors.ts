import { z } from "zod";

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "INVALID_REQUEST",
  "UNAUTHORIZED",
  "INVALID_CREDENTIALS",
  "EMAIL_TAKEN",
  "NOT_FOUND",
  "DOCUMENT_NOT_READY",
  "GENERATION_FAILED",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Body of every non-2xx JSON response. `code` is a plain string so older
 * clients keep working when the server adds a new code.
 */
export const ApiErrorBody = z.object({
  code: z.string(),
  message: z.string(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;
