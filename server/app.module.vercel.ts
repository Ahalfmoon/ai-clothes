import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { HistoryModule } from './modules/history/history.module';
import { UploadModule } from './modules/upload/upload.module';
import { AIModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Business modules
    AIModule,
    UploadModule,
    HistoryModule,

    // View module (fallback route, must be last)
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
