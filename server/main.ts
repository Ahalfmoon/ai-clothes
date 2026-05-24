import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { __express as hbsExpressEngine } from 'hbs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

let cachedApp: NestExpressApplication | null = null;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: process.env.NODE_ENV !== 'development',
  });

  // 启用 CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // 配置静态文件服务 - 用于上传的图片
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 注册视图引擎, 渲染 client 目录下的 html 文件
  app.setBaseViewsDir(join(process.cwd(), 'dist/client'));
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);

  cachedApp = app;
  return app;
}

async function bootstrap() {
  const app = await createApp();

  const logger = new Logger('Bootstrap');
  const host = process.env.SERVER_HOST || 'localhost';
  const port = Number(process.env.SERVER_PORT || '3000');

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`API endpoints ready at http://${host}:${port}/api`);
  logger.log(`Uploads served from http://${host}:${port}/uploads/`);
}

// Only run bootstrap if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap();
}

export { createApp };
