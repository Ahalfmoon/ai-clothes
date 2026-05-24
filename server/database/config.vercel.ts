import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

// Vercel Postgres configuration
// This uses the Vercel Postgres connection automatically
export const db = drizzle(sql);

// Export for use in services
export default db;
