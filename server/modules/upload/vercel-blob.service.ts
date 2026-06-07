import { Injectable } from '@nestjs/common';
import { put, del } from '@vercel/blob';

@Injectable()
export class VercelBlobService {
  private readonly isEnabled: boolean;

  constructor() {
    // 检查是否配置了 Vercel Blob Token
    this.isEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;
  }

  async uploadImage(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    if (!this.isEnabled) {
      throw new Error('Vercel Blob is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.');
    }

    try {
      const blob = await put(filename, file, {
        access: 'public',
      });

      return {
        url: blob.url,
        key: blob.url,
      };
    } catch (error) {
      throw new Error(`Blob upload failed: ${error.message}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Vercel Blob is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.');
    }

    try {
      await del(url);
    } catch (error) {
      throw new Error(`Blob delete failed: ${error.message}`);
    }
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}
