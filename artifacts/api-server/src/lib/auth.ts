import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env";

const BCRYPT_COST = 10;
const TOKEN_LIFETIME = "30d";

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({}, env.SESSION_SECRET, {
    algorithm: "HS256",
    subject: userId,
    expiresIn: TOKEN_LIFETIME,
  });
}

/** Returns the user id from a valid, unexpired token, or null. */
export function readToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.SESSION_SECRET, { algorithms: ["HS256"] });
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
