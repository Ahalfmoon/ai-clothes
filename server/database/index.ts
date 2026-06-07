import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

export function getDatabase() {
  if (db) return db;

  const isVercel = !!(process.env.VERCEL || process.env.POSTGRES_URL);

  if (isVercel) {
    // Vercel 环境：使用 @vercel/postgres（自动读取 POSTGRES_* 环境变量）
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { drizzle } = require('drizzle-orm/vercel-postgres');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sql } = require('@vercel/postgres');
    db = drizzle(sql);
    return db;
  }

  // 本地环境：使用 postgres-js，懒加载避免启动时崩溃
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { drizzle: drizzlePgJs } = require('drizzle-orm/postgres-js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const postgres = require('postgres');

  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/ai_outfit';

  try {
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzlePgJs(client);
    return db;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// Proxy 模式：首次访问时才真正连接数据库
export default new Proxy({} as PostgresJsDatabase, {
  get(_target, prop) {
    const database = getDatabase();
    const value = database[prop];
    if (typeof value === 'function') {
      return value.bind(database);
    }
    return value;
  },
});
