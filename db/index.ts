import dotenv from "dotenv";
import path from "path";

// Delete any existing DATABASE_URL to force reload
delete process.env.DATABASE_URL;

// Explicitly load .env from project root
const envPath = path.resolve(process.cwd(), '.env');
console.log('[DB] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  console.error('[DB] Error loading .env:', result.error);
} else {
  console.log('[DB] .env loaded successfully');
  console.log('[DB] Parsed DATABASE_URL:', result.parsed?.DATABASE_URL ? 'YES' : 'NO');
}
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });