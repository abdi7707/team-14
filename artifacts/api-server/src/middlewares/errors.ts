import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/httpError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // body-parser errors (malformed JSON, body too large) are safe to show to the client.
  if (err?.expose && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: { code: "INVALID_REQUEST", message: err.message } });
    return;
  }

  res.err = err;
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  });
};
