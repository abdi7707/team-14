import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export * from "./schema";
export { and, desc, eq } from "drizzle-orm";

export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 10 });
  return drizzle({ client: pool, schema });
}

export type Db = ReturnType<typeof createDb>;
