import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

function positiveInteger(value: string | undefined, fallback: number) {
  if (value === undefined || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error("DATABASE_MAX_CONNECTIONS must be a positive integer");
  }

  return parsed;
}

const isVercel = process.env.VERCEL === "1";
const maxConnections = positiveInteger(
  process.env.DATABASE_MAX_CONNECTIONS,
  isVercel ? 1 : 10,
);

const client = globalForDb.client ?? postgres(databaseUrl, {
  max: maxConnections,
  // Supabase's transaction pooler does not support prepared statements.
  // Disabling them is also compatible with direct Postgres and Neon URLs.
  prepare: process.env.DATABASE_PREPARED_STATEMENTS === "true",
  ...(isVercel ? { idle_timeout: 20 } : {}),
});

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle({ client, relations });
