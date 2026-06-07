import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VercelBlobService {
  private readonly logger = new Logger(VercelBlobService.name);
  private readonly isEnabled: boolean;
  private blobModule: any = null;

  constructor() {
    this.isEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (this.isEnabled) {
      // 动态加载避免 @vercel/blob 未安装时崩溃
      try {
        this.blobModule = require('@vercel/blob');
        this.logger.log('Vercel Blob 模块加载成功');
      } catch {
        this.logger.warn('@vercel/blob 未安装，降级到内存存储');
      }
    }
  }

  async uploadImage(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    if (!this.isEnabled || !this.blobModule) {
      throw new Error('Vercel Blob is not available');
    }

    try {
      const blob = await this.blobModule.put(filename, file, {
        access: 'public',
      });
      return { url: blob.url, key: blob.url };
    } catch (error: any) {
      throw new Error(`Blob upload failed: ${error.message}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.isEnabled || !this.blobModule) {
      throw new Error('Vercel Blob is not available');
    }

    try {
      await this.blobModule.del(url);
    } catch (error: any) {
      throw new Error(`Blob delete failed: ${error.message}`);
    }
  }

  isConfigured(): boolean {
    return this.isEnabled && !!this.blobModule;
  }
}
