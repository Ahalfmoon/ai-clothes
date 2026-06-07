import { Injectable, Logger } from "@nestjs/common";
import { HistoryFileStore } from "./history-file-store.service";
import type {
  HistoryRecord,
  CreateHistoryRequest,
} from "@shared/api.interface";

/**
 * 历史记录服务
 *
 * Vercel: 使用内存存储（serverless 无文件系统）
 * 本地: 使用 JSON 文件存储
 * 未来: 可配置 Vercel Postgres
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly fileStore: HistoryFileStore;

  constructor() {
    this.fileStore = new HistoryFileStore();
    this.logger.log('历史记录服务初始化完成（内存/文件混合模式）');
  }

  async create(
    userId: string,
    dto: CreateHistoryRequest
  ): Promise<{ id: string }> {
    return this.fileStore.create(userId, dto);
  }

  async getList(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: HistoryRecord[]; total: number }> {
    return this.fileStore.getList(userId, page, pageSize);
  }

  async delete(userId: string, id: string): Promise<{ success: boolean }> {
    return this.fileStore.delete(userId, id);
  }
}
