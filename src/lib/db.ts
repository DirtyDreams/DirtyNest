import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dirtynest:ae132a343bbfe69efb3e083a176c695d@localhost:5432/dirtynest";

// Global connection pool for Next.js HMR
const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
  _initialized?: boolean;
};

const client =
  globalForDb._pgClient ||
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });

// Auto-initialize tables in PostgreSQL if missing
if (!globalForDb._initialized) {
  globalForDb._initialized = true;
  client.unsafe(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      priority VARCHAR(20) NOT NULL DEFAULT 'normal',
      due_date VARCHAR(100)
    );
    CREATE TABLE IF NOT EXISTS hermes_sessions (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      profile VARCHAR(100) NOT NULL DEFAULT 'dirtydaily',
      model VARCHAR(100) NOT NULL DEFAULT 'Nous-Hermes-3-Llama-3.1-8B',
      cwd TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'IDLE',
      created_at VARCHAR(100) NOT NULL,
      updated_at VARCHAR(100) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hermes_messages (
      id VARCHAR(100) PRIMARY KEY,
      session_id VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      reasoning_trace TEXT,
      created_at VARCHAR(100) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hermes_tool_logs (
      id VARCHAR(100) PRIMARY KEY,
      session_id VARCHAR(100) NOT NULL,
      tool_name VARCHAR(100) NOT NULL,
      parameters_json TEXT NOT NULL,
      result_json TEXT,
      risk_level VARCHAR(50) NOT NULL DEFAULT 'low',
      permission_status VARCHAR(50) NOT NULL DEFAULT 'AUTO_APPROVED',
      execution_time_ms INTEGER DEFAULT 0,
      timestamp VARCHAR(100) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hermes_memories (
      id VARCHAR(100) PRIMARY KEY,
      category VARCHAR(50) NOT NULL DEFAULT 'fact',
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      tags_json TEXT,
      recall_count INTEGER NOT NULL DEFAULT 0,
      created_at VARCHAR(100) NOT NULL
    );
  `).catch((err) => {
    console.warn("PostgreSQL table auto-init warning:", err?.message || err);
  });
}
