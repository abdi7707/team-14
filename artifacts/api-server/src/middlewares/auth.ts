import { eq, users } from "@workspace/db";
import type { RequestHandler } from "express";
import { readToken } from "../lib/auth";
import { db } from "../lib/db";
import { HttpError } from "../lib/httpError";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  const userId = token ? readToken(token) : null;

  const user = userId ? await db.query.users.findFirst({ where: eq(users.id, userId) }) : undefined;
  if (!user) {
    throw new HttpError(401, "UNAUTHORIZED", "Please sign in again.");
  }

  req.user = user;
  next();
};
