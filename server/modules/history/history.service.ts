import { Injectable, Logger } from "@nestjs/common";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { history } from "@server/database/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type {
  HistoryRecord,
  CreateHistoryRequest,
} from "@shared/api.interface";

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly db;

  constructor() {
    // 使用环境变量中的数据库 URL
    const connectionString = process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      'postgresql://postgres:postgres@localhost:5432/ai_outfit';

    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  async create(
    userId: string,
    dto: CreateHistoryRequest
  ): Promise<{ id: string }> {
    try {
      const [result] = await this.db
        .insert(history)
        .values({
          userId: userId,
          originalPhotoUrl: dto.originalPhotoUrl,
          clothingPhotoUrl: dto.clothingPhotoUrl,
          resultPhotoUrl: dto.resultPhotoUrl,
          styleSuggestion: dto.styleSuggestion,
          status: dto.status,
        })
        .returning({ id: history.id });

      return { id: result.id };
    } catch (error) {
      this.logger.error('Failed to create history', error);
      throw error;
    }
  }

  async getList(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: HistoryRecord[]; total: number }> {
    try {
      const totalResult = await this.db
        .select({ count: count() })
        .from(history)
        .where(eq(history.userId, userId));

      const total = Number(totalResult[0].count);

      if (page < 1) {
        return { items: [], total };
      }

      const items = await this.db
        .select({
          id: history.id,
          originalPhotoUrl: history.originalPhotoUrl,
          clothingPhotoUrl: history.clothingPhotoUrl,
          resultPhotoUrl: history.resultPhotoUrl,
          styleSuggestion: history.styleSuggestion,
          status: history.status,
          createdAt: history.createdAt,
        })
        .from(history)
        .where(eq(history.userId, userId))
        .orderBy(desc(history.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        items: items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          status: item.status as "pending" | "success" | "failed",
        })),
        total,
      };
    } catch (error) {
      this.logger.error('Failed to get history list', error);
      return { items: [], total: 0 };
    }
  }

  async delete(userId: string, id: string): Promise<{ success: boolean }> {
    try {
      await this.db
        .delete(history)
        .where(and(eq(history.id, id), eq(history.userId, userId)));

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete history', error);
      return { success: false };
    }
  }
}
