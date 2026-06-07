/**
 * Vercel Serverless Function — 所有 /api/* 请求入口
 *
 * 请求链路：
 *   浏览器 fetch('/api/upload/image')
 *     → Vercel rewrites → /api/index?__path=upload/image
 *     → api/index.ts 恢复 req.url 为 /api/upload/image
 *     → NestJS/Express 路由匹配 → POST /api/upload/image ✅
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createApp } = require('../dist/server/main');
  const nestApp = await createApp();
  cachedApp = nestApp.getHttpAdapter().getInstance();
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ---- 调试：打印收到的原始请求 ----
  console.log(JSON.stringify({
    event: 'request',
    method: req.method,
    url: req.url,
    query: (req as any).query,
  }));

  // ---- 恢复原始 URL ----
  // vercel.json rewrites: /api/upload/image?foo=bar → /api/index?__path=upload/image&foo=bar
  // req.url 此时可能是 /api/index?__path=... 也可能是原始 /api/upload/image（取决于 Vercel runtime 版本）
  // 目标：统一变成 /api/upload/image?foo=bar
  const rawUrl = req.url || '/';
  const queryIndex = rawUrl.indexOf('?');

  if (queryIndex !== -1) {
    // URL 里有 query string，尝试提取 __path
    const qs = rawUrl.slice(queryIndex + 1);
    const params = new URLSearchParams(qs);
    const __path = params.get('__path');

    if (__path) {
      params.delete('__path');
      const rest = params.toString();
      req.url = '/api/' + __path + (rest ? '?' + rest : '');
    }
  }

  // 如果 __path 不在 req.url 的 query 里，试试 Vercel 注入的 req.query
  if (!req.url || req.url === '/api/index' || req.url.startsWith('/api/index?')) {
    const vq = (req as any).query;
    if (vq && vq.__path) {
      const __path = String(vq.__path);
      // 重建其他参数
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(vq)) {
        if (k !== '__path' && typeof v === 'string') sp.set(k, v);
      }
      const rest = sp.toString();
      req.url = '/api/' + __path + (rest ? '?' + rest : '');
    }
  }

  console.log(JSON.stringify({
    event: 'restored',
    method: req.method,
    finalUrl: req.url,
  }));

  // ---- CORS ----
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // ---- 交给 NestJS ----
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[api/index] error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
