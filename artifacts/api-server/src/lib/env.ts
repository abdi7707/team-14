import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  SESSION_SECRET: z.string({ error: "is required" }).min(32, "must be at least 32 characters"),
});

export type Env = z.infer<typeof EnvSchema>;

// Variables already set in the environment (for example by the hosting platform)
// take precedence over the repository-root .env file.
function loadWorkspaceEnvFile() {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
  const file = path.join(dir, ".env");
  if (existsSync(file)) process.loadEnvFile(file);
}

function loadEnv(): Env {
  loadWorkspaceEnvFile();

  // Blank values copied from .env.example mean "use the default".
  const values = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ""),
  );

  const result = EnvSchema.safeParse(values);
  if (!result.success) {
    console.error("Invalid environment configuration:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("Copy .env.example to .env at the repository root and fill in the values.");
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
