import {
  LoginBody,
  RegisterBody,
  type AuthResponse,
  type MeResponse,
  type User,
} from "@workspace/api-zod";
import { eq, users, type UserRow } from "@workspace/db";
import { Router } from "express";
import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { db } from "../lib/db";
import { env } from "../lib/env";
import { HttpError } from "../lib/httpError";
import { parseBody } from "../lib/validation";
import { requireAuth } from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimits";

export const authRouter = Router();

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    phone: row.phone,
    role: row.role,
    preferredLanguage: row.preferredLanguage,
  };
}

function authResponse(row: UserRow): AuthResponse {
  return { token: signToken(row.id), user: toUser(row) };
}

authRouter.post("/auth/register", authLimiter, async (req, res) => {
  const body = parseBody(RegisterBody, req.body);

  const [user] = await db
    .insert(users)
    .values({
      email: body.email,
      passwordHash: await hashPassword(body.password),
      fullName: body.fullName,
      role: env.ADMIN_EMAILS.includes(body.email) ? "admin" : "user",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (!user) {
    throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists.");
  }
  res.status(201).json(authResponse(user));
});

authRouter.post("/auth/login", authLimiter, async (req, res) => {
  const body = parseBody(LoginBody, req.body);

  const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  res.json(authResponse(user));
});

authRouter.get("/auth/me", requireAuth, (req, res) => {
  const body: MeResponse = { user: toUser(req.user!) };
  res.json(body);
});
