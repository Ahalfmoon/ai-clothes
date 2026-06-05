import { Injectable, Logger } from "@nestjs/common";
import { HistoryFileStore } from "./history-file-store.service";
import type {
  HistoryRecord,
  CreateHistoryRequest,
} from "@shared/api.interface";

/**
 * 历史记录服务
 *
 * Vercel 环境: 使用 PostgreSQL (Drizzle ORM)
 * 本地开发: 使用 JSON 文件存储（无需安装数据库）
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly fileStore: HistoryFileStore;
  private dbAvailable = false;

  constructor() {
    this.fileStore = new HistoryFileStore();
    // 本地开发环境检查数据库连接
    this.checkDatabaseAvailability();
  }

  /**
   * 检查数据库是否可用
   * 本地开发环境下通常没有 PostgreSQL，自动降级为文件存储
   */
  private async checkDatabaseAvailability(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.warn('未配置 DATABASE_URL，使用本地文件存储历史记录');
      this.dbAvailable = false;
      return;
    }

    // 尝试连接数据库
    try {
      // 动态导入避免模块加载时崩溃
      const { drizzle } = require('drizzle-orm/postgres-js');
      const postgres = require('postgres');

      const client = postgres(dbUrl, {
        max: 1,
        idle_timeout: 5,
        connect_timeout: 5, // 5秒超时
      });

      // 尝试执行一个简单查询验证连接
      await client`SELECT 1`;
      await client.end();

      this.dbAvailable = true;
      this.logger.log('数据库连接成功，使用 PostgreSQL 存储历史记录');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`数据库不可用 (${msg})，降级为本地文件存储`);
      this.dbAvailable = false;
    }
  }

  async create(
    userId: string,
    dto: CreateHistoryRequest
  ): Promise<{ id: string }> {
    // 文件存储模式
    if (!this.dbAvailable) {
      return this.fileStore.create(userId, dto);
    }

    // 数据库模式
    try {
      const { history } = require('@server/database/schema');
      const db = require('@server/database').default;

      const [result] = await db
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
      this.logger.error('数据库写入失败，降级为文件存储', error);
      this.dbAvailable = false;
      return this.fileStore.create(userId, dto);
    }
  }

  async getList(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: HistoryRecord[]; total: number }> {
    // 文件存储模式
    if (!this.dbAvailable) {
      return this.fileStore.getList(userId, page, pageSize);
    }

    // 数据库模式
    try {
      const { history } = require('@server/database/schema');
      const { eq, desc, count } = require('drizzle-orm');
      const db = require('@server/database').default;

      const totalResult = await db
        .select({ count: count() })
        .from(history)
        .where(eq(history.userId, userId));

      const total = Number(totalResult[0].count);

      if (page < 1) {
        return { items: [], total };
      }

      const items = await db
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
        items: items.map((item: any) => ({
          ...item,
          createdAt: item.createdAt instanceof Date
            ? item.createdAt.toISOString()
            : String(item.createdAt),
          status: item.status as "pending" | "success" | "failed",
        })),
        total,
      };
    } catch (error) {
      this.logger.error('数据库查询失败，降级为文件存储', error);
      this.dbAvailable = false;
      return this.fileStore.getList(userId, page, pageSize);
    }
  }

  async delete(userId: string, id: string): Promise<{ success: boolean }> {
    // 文件存储模式
    if (!this.dbAvailable) {
      return this.fileStore.delete(userId, id);
    }

    // 数据库模式
    try {
      const { history } = require('@server/database/schema');
      const { eq, and } = require('drizzle-orm');
      const db = require('@server/database').default;

      await db
        .delete(history)
        .where(and(eq(history.id, id), eq(history.userId, userId)));

      return { success: true };
    } catch (error) {
      this.logger.error('数据库删除失败，降级为文件存储', error);
      this.dbAvailable = false;
      return this.fileStore.delete(userId, id);
    }
  }
}
