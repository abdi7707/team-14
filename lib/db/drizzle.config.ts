import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Same rule as the API: variables already in the environment win over the root .env file.
const rootEnvFile = "../../.env";
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Add it to .env at the repository root.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  dbCredentials: { url },
  verbose: true,
});
