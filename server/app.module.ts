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
    // 环境配置 - 加载 .env 和 .env.local
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 业务模块
    AIModule,
    UploadModule,
    HistoryModule,

    // 视图模块（兜底路由，必须最后注册）
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
