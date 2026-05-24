import { Injectable, Logger } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * 本地文件存储服务
 * 部署到 Vercel 时替换为 Vercel Blob Storage
 */
@Injectable()
export class BlobService {
  private readonly logger = new Logger(BlobService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // 确保 uploads 目录存在
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create uploads directory', error);
    }
  }

  /**
   * 保存图片到本地
   */
  async uploadImage(
    file: Buffer,
    filename: string,
    options?: { contentType?: string }
  ): Promise<{ url: string; key: string }> {
    try {
      const filepath = join(this.uploadDir, filename);
      await fs.writeFile(filepath, file);

      // 返回本地 URL
      const url = `http://localhost:3000/uploads/${filename}`;

      this.logger.log(`Image saved: ${filepath}`);

      return {
        url,
        key: filename,
      };
    } catch (error) {
      this.logger.error('Failed to save image', error);
      throw new Error('图片保存失败');
    }
  }

  /**
   * 删除图片
   */
  async deleteImage(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (filename) {
        const filepath = join(this.uploadDir, filename);
        await fs.unlink(filepath);
        this.logger.log(`Image deleted: ${filepath}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete image', error);
    }
  }
}
