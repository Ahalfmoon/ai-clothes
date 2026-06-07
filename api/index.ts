/**
 * Vercel Serverless Function Entry Point
 * 使用 require() 而非 import，避免 esbuild 将 NestJS 整个打包导致失败
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 缓存 Express app 实例，避免冷启动时重复初始化
let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createApp } = require('../dist/server/main');
  const nestApp = await createApp();
  const httpAdapter = nestApp.getHttpAdapter();
  cachedApp = httpAdapter.getInstance();
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Vercel rewrites 把 /api/xxx 重写为 /api/index?__path=xxx
    // 从 query 参数恢复原始 URL，否则 NestJS 匹配不到路由
    const forwardedPath = req.query.__path;
    if (forwardedPath && typeof forwardedPath === 'string') {
      req.url = '/api/' + forwardedPath;
    }

    // CORS 预检
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
