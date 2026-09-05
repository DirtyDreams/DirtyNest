import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const line = readFileSync(".env.local", "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith("DATABASE_URL="));
    if (line) {
      const value = line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
      if (value) return value;
    }
  } catch {
    // .env.local absent — fall through to the error
  }
  throw new Error("DATABASE_URL is not set — define it in .env.local or the environment");
}

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: resolveDatabaseUrl() },
});