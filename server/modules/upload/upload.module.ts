import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { BlobService } from './blob.service';
import { VercelBlobService } from './vercel-blob.service';

@Module({
  controllers: [UploadController],
  providers: [
    BlobService,
    {
      provide: 'VercelBlobService',
      useClass: VercelBlobService,
    },
  ],
  exports: [BlobService, 'VercelBlobService'],
})
export class UploadModule {}
