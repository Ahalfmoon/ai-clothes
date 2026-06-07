import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as os from 'os';

/**
 * 本地文件存储服务（Vercel Blob 未配置时的降级方案）
 *
 * 本地: uploads/ 目录
 * Vercel: /tmp/uploads/ (唯一可写目录)
 * 不可写环境: 内存存储（Buffer 缓存）
 */
@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private readonly uploadDir: string;
  private fsAvailable = false;
  // 文件系统不可写时的内存缓存
  private memoryStore = new Map<string, { buffer: Buffer; contentType?: string }>();

  constructor() {
    // 检测文件系统是否可写
    const tmpDir = os.tmpdir();
    const testFile = join(tmpDir, '.write-test-blob');
    try {
      const testFd = require('fs').openSync(testFile, 'w');
      require('fs').closeSync(testFd);
      require('fs').unlinkSync(testFile);
      this.fsAvailable = true;
      this.uploadDir = join(tmpDir, 'uploads');
    } catch {
      this.logger.warn('文件系统不可写 (Vercel serverless)，使用 Vercel Blob 或内存存储');
      this.fsAvailable = false;
      this.uploadDir = '';
    }
  }

  private async ensureUploadDir(): Promise<boolean> {
    if (!this.fsAvailable) return false;
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      return true;
    } catch {
      this.fsAvailable = false;
      return false;
    }
  }

  async uploadImage(
    file: Buffer,
    filename: string,
    options?: { contentType?: string },
  ): Promise<{ url: string; key: string }> {
    // 文件系统模式
    if (this.fsAvailable && (await this.ensureUploadDir())) {
      const filepath = join(this.uploadDir, filename);
      await fs.writeFile(filepath, file);
      const url = `http://localhost:3000/uploads/${filename}`;
      return { url, key: filename };
    }

    // 内存存储模式 (Vercel serverless 无文件系统)
    this.memoryStore.set(filename, { buffer: file, contentType: options?.contentType });
    this.logger.log(`图片已存入内存缓存: ${filename}`);

    return {
      url: `memory://${filename}`,
      key: filename,
    };
  }

  getCachedImage(filename: string): Buffer | null {
    const entry = this.memoryStore.get(filename);
    return entry ? entry.buffer : null;
  }

  async deleteImage(url: string): Promise<void> {
    const filename = url.split('/').pop() || url.replace('memory://', '');
    if (this.memoryStore.has(filename)) {
      this.memoryStore.delete(filename);
      return;
    }
    if (this.fsAvailable) {
      try {
        await fs.unlink(join(this.uploadDir, filename));
      } catch {
        this.logger.warn(`删除图片失败: ${url}`);
      }
    }
  }
}
