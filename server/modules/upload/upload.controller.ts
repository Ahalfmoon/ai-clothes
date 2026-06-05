import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Logger, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlobService } from './blob.service';
import { VercelBlobService } from './vercel-blob.service';

@Controller('api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly blobService: BlobService,
    @Inject('VercelBlobService') private readonly vercelBlobService: VercelBlobService,
  ) {}

  /**
   * Upload image endpoint
   * Accepts multipart/form-data file upload
   * Automatically uses Vercel Blob if configured, otherwise falls back to local storage
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('请选择要上传的文件');
      }

      // 验证文件类型
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('只支持 JPG、PNG、WebP 格式的图片');
      }

      // 验证文件大小
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('文件大小不能超过 10MB');
      }

      const filename = `outfit-${Date.now()}-${Math.random().toString(36).slice(2)}.${this.getExtension(file.mimetype)}`;

      // 自动选择存储后端：Vercel Blob 优先，本地存储备用
      let result: { url: string; key: string };
      if (this.vercelBlobService.isConfigured()) {
        this.logger.log('Using Vercel Blob for upload');
        result = await this.vercelBlobService.uploadImage(file.buffer, filename);
      } else {
        this.logger.log('Using local storage for upload');
        result = await this.blobService.uploadImage(
          file.buffer,
          filename,
          { contentType: file.mimetype }
        );
      }

      this.logger.log(`Image uploaded: ${result.url}`);

      return {
        success: true,
        url: result.url,
        filename: file.originalname,
        storage: this.vercelBlobService.isConfigured() ? 'vercel-blob' : 'local',
      };
    } catch (error) {
      this.logger.error('Upload failed', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('图片上传失败');
    }
  }

  private getExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }
}
