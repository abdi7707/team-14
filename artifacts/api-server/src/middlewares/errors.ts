import type { ApiErrorBody } from "@workspace/api-zod";
import type { ErrorRequestHandler, RequestHandler, Response } from "express";
import { HttpError } from "../lib/httpError";

function sendError(res: Response, status: number, body: ApiErrorBody) {
  res.status(status).json(body);
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    sendError(res, err.status, { code: err.code, message: err.message });
    return;
  }

  // body-parser errors (malformed JSON, body too large) are safe to show to the client.
  if (err?.expose && err.status >= 400 && err.status < 500) {
    sendError(res, err.status, { code: "INVALID_REQUEST", message: err.message });
    return;
  }

  res.err = err;
  sendError(res, 500, {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
  });
};
