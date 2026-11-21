import type { UserRow } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth. */
      user?: UserRow;
    }
  }
}
