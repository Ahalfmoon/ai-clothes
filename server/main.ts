// 屏蔽 url.parse 等第三方依赖触发的弃用警告（@vercel/postgres, postgres 包内部使用）
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (
    warning.name === 'DeprecationWarning' &&
    (warning.message.includes('url.parse') || warning.message.includes('url.format'))
  ) {
    return; // 吞掉 url.parse 警告
  }
  console.warn(warning.name, warning.message);
});

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
  // 开发模式: process.cwd() = 项目根目录, uploads 目录在根目录下
  // 生产模式: __dirname/.. = dist 上级即项目根
  app.useStaticAssets(
    process.env.NODE_ENV === 'production'
      ? join(__dirname, '..', 'uploads')
      : join(process.cwd(), 'uploads'),
    { prefix: '/uploads/' },
  );

  // 仅在生产环境配置前端静态文件和视图引擎
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (isProduction) {
    app.useStaticAssets(join(__dirname, '..', 'dist', 'client'), {
      prefix: '/',
    });

    // 注册视图引擎, 渲染 client 目录下的 html 文件
    app.setBaseViewsDir(join(__dirname, '..', 'dist', 'client'));
    app.setViewEngine('html');
    app.engine('html', hbsExpressEngine);
  }

  cachedApp = app;
  return app;
}

async function bootstrap() {
  const app = await createApp();

  // 不设置全局前缀，让每个模块自己处理
  // ViewController 处理前端路由
  // 其他控制器在模块级别设置 /api 前缀

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
