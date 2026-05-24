/* Vercel Postgres schema - simplified version for global deployment */
import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const history = pgTable("history", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  userId: varchar({ length: 255 }).notNull(),
  originalPhotoUrl: text().notNull(),
  clothingPhotoUrl: text().notNull(),
  resultPhotoUrl: text(),
  styleSuggestion: text(),
  status: varchar({ length: 50 }).default('pending').notNull(),
  createdAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_history_user_id").on(table.userId),
]);

// Table aliases
export const historyTable = history;

// Types
export type HistoryRecord = typeof history.$inferSelect;
export type NewHistoryRecord = typeof history.$inferInsert;
