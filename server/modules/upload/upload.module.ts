import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { BlobService } from './blob.service';

@Module({
  controllers: [UploadController],
  providers: [BlobService],
  exports: [BlobService],
})
export class UploadModule {}
