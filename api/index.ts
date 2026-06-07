/**
 * Vercel Serverless Function Entry Point
 * 所有 /api/* 请求通过 vercel.json rewrites 汇聚到此
 * rewrite: /api/upload/image?foo=1 → /api/index?__path=upload/image&foo=1
 * 此函数负责还原原始 req.url 后交给 NestJS/Express 处理
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  const { createApp } = require('../dist/server/main');
  const nestApp = await createApp();
  const httpAdapter = nestApp.getHttpAdapter();
  cachedApp = httpAdapter.getInstance();
  return cachedApp;
}

/** 从 rewrite query 中取出 __path，还原 req.url = /api/原路径?原参数 */
function restoreOriginalUrl(req: VercelRequest): void {
  try {
    const raw = req.url || '/';
    const qi = raw.indexOf('?');
    if (qi === -1) return;

    const qs = raw.slice(qi + 1);
    const params = new URLSearchParams(qs);
    const path = params.get('__path');
    if (!path) return;

    params.delete('__path');
    const rest = params.toString();
    req.url = '/api/' + path + (rest ? '?' + rest : '');
  } catch {
    // 解析失败不做任何改动
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    restoreOriginalUrl(req);

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
