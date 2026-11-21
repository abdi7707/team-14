import type { z } from "zod";
import { HttpError } from "./httpError";

/** Parses a request body or throws a 400 whose message is safe to show to the user. */
export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const issue = result.error.issues[0];
  if (!issue) throw new HttpError(400, "VALIDATION_ERROR", "The request is not valid.");
  // Top-level fields carry form-ready messages; nested ones (the passport) need the path.
  const where = issue.path.length > 1 ? ` (${issue.path.join(".")})` : "";
  throw new HttpError(400, "VALIDATION_ERROR", `${issue.message}${where}`);
}
