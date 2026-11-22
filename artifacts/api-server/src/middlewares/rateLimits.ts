import type { ApiErrorBody } from "@workspace/api-zod";
import { rateLimit } from "express-rate-limit";

const tooManyRequests: ApiErrorBody = {
  code: "RATE_LIMITED",
  message: "Too many requests. Please wait a moment and try again.",
};

/** Shared by register and login: 30 requests per 15 minutes per IP address. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooManyRequests,
});

/**
 * 6 generations per minute per account. Keyed by user rather than IP so people
 * sharing one network (a venue's Wi-Fi) do not block each other. Must run after requireAuth.
 */
/** 10 payment calls per minute per account. */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  message: tooManyRequests,
});

export const generationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 6,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => req.user!.id,
  message: tooManyRequests,
});
