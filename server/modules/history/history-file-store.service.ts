import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { HistoryRecord, CreateHistoryRequest } from '@shared/api.interface';

/**
 * 本地文件存储服务
 * 当 DATABASE_URL 未配置时使用 JSON 文件存储历史记录
 * 文件位置: uploads/history/records.json
 */
export class HistoryFileStore {
  private readonly logger = new Logger(HistoryFileStore.name);
  private readonly storeDir: string;
  private readonly storeFile: string;
  private cache: HistoryRecord[] | null = null;

  constructor() {
    this.storeDir = path.join(process.cwd(), 'uploads', 'history');
    this.storeFile = path.join(this.storeDir, 'records.json');
    this.ensureStoreExists();
  }

  private ensureStoreExists(): void {
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
      this.logger.log(`创建历史记录存储目录: ${this.storeDir}`);
    }
    if (!fs.existsSync(this.storeFile)) {
      fs.writeFileSync(this.storeFile, '[]', 'utf-8');
    }
  }

  private readStore(): HistoryRecord[] {
    if (this.cache) return this.cache;
    try {
      const raw = fs.readFileSync(this.storeFile, 'utf-8');
      this.cache = JSON.parse(raw);
      return this.cache!;
    } catch {
      this.cache = [];
      return [];
    }
  }

  private writeStore(records: HistoryRecord[]): void {
    this.cache = records;
    fs.writeFileSync(this.storeFile, JSON.stringify(records, null, 2), 'utf-8');
  }

  async create(_userId: string, dto: CreateHistoryRequest): Promise<{ id: string }> {
    const records = this.readStore();
    const newRecord: HistoryRecord = {
      id: uuidv4(),
      originalPhotoUrl: dto.originalPhotoUrl,
      clothingPhotoUrl: dto.clothingPhotoUrl,
      resultPhotoUrl: dto.resultPhotoUrl,
      styleSuggestion: dto.styleSuggestion,
      status: dto.status,
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    this.writeStore(records);
    this.logger.log(`[文件存储] 创建历史记录: ${newRecord.id}`);
    return { id: newRecord.id };
  }

  async getList(
    _userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: HistoryRecord[]; total: number }> {
    const records = this.readStore();
    const sorted = [...records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const total = sorted.length;

    if (page < 1) return { items: [], total };

    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return { items, total };
  }

  async delete(_userId: string, id: string): Promise<{ success: boolean }> {
    const records = this.readStore();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return { success: false };

    records.splice(index, 1);
    this.writeStore(records);
    this.logger.log(`[文件存储] 删除历史记录: ${id}`);
    return { success: true };
  }
}
