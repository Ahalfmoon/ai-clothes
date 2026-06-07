import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import type { HistoryRecord, CreateHistoryRequest } from '@shared/api.interface';

/**
 * 内存 + 文件混合存储服务
 *
 * 优先使用内存存储，当文件系统可写时同步到磁盘
 * Vercel: 仅内存存储（/tmp 跨请求不共享）
 * 本地: uploads/history/records.json
 */
export class HistoryFileStore {
  private readonly logger = new Logger(HistoryFileStore.name);
  private readonly storeDir: string;
  private readonly storeFile: string;
  private memoryStore: HistoryRecord[] = [];
  private fsAvailable = false;

  constructor() {
    // 检测文件系统是否可写
    const tmpDir = os.tmpdir();
    const testFile = path.join(tmpDir, '.write-test');
    try {
      fs.writeFileSync(testFile, 'test', 'utf-8');
      fs.unlinkSync(testFile);
      this.fsAvailable = true;

      // 使用 /tmp 或 os.tmpdir() 作为可写目录
      const baseDir = path.join(tmpDir, 'uploads');
      this.storeDir = path.join(baseDir, 'history');
      this.storeFile = path.join(this.storeDir, 'records.json');
    } catch {
      this.logger.warn('文件系统不可写，使用纯内存存储');
      this.fsAvailable = false;
      this.storeDir = '';
      this.storeFile = '';
    }
  }

  private ensureStoreExists(): boolean {
    if (!this.fsAvailable) return false;
    try {
      if (!fs.existsSync(this.storeDir)) {
        fs.mkdirSync(this.storeDir, { recursive: true });
      }
      if (!fs.existsSync(this.storeFile)) {
        fs.writeFileSync(this.storeFile, '[]', 'utf-8');
      }
      this.logger.log(`历史记录存储就绪: ${this.storeFile}`);
      return true;
    } catch {
      this.logger.warn('文件存储不可用，使用内存存储');
      this.fsAvailable = false;
      return false;
    }
  }

  private readStore(): HistoryRecord[] {
    if (!this.fsAvailable) return this.memoryStore;
    try {
      const raw = fs.readFileSync(this.storeFile, 'utf-8');
      const records = JSON.parse(raw);
      this.memoryStore = records;
      return records;
    } catch {
      return this.memoryStore;
    }
  }

  private writeStore(records: HistoryRecord[]): void {
    this.memoryStore = records;
    if (!this.fsAvailable) return;
    try {
      fs.writeFileSync(this.storeFile, JSON.stringify(records, null, 2), 'utf-8');
    } catch {
      this.fsAvailable = false;
      this.logger.warn('写入文件失败，切换到内存存储');
    }
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
    return { success: true };
  }
}
