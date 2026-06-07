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
  // ============================================================
  // 诊断端点：直接返回当前请求信息，完全绕过 NestJS
  // 浏览器访问 /api/ping 测试 handler 是否被调用
  // ============================================================
  if (req.method === 'GET') {
    const urlPath = (req.url || '/').split('?')[0];
    if (urlPath === '/api/ping' || urlPath === '/api/index' && (req as any).query?.__path === 'ping') {
      res.status(200).json({
        ok: true,
        handler: 'api/index.ts is WORKING',
        rawUrl: req.url,
        query: (req as any).query,
        headers: req.headers['x-forwarded-host'] || 'none',
        timestamp: Date.now(),
      });
      return;
    }
  }

  // ---- CORS ----
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // ---- 恢复原始 URL ----
  // Vercel rewrites: /api/history?page=1 → /api/index?__path=history&page=1
  // 目标: req.url = /api/history?page=1
  let path: string | null = null;
  const extraParams = new URLSearchParams();

  // 方式1: 从 req.url 的 query string 解析
  const rawUrl = req.url || '/';
  const qi = rawUrl.indexOf('?');
  if (qi !== -1) {
    const qp = new URLSearchParams(rawUrl.slice(qi + 1));
    path = qp.get('__path') || null;
    qp.forEach((v, k) => { if (k !== '__path') extraParams.set(k, v); });
  }

  // 方式2: 从 Vercel runtime 注入的 req.query
  if (!path) {
    const vq = (req as any).query;
    if (vq?.__path) {
      path = String(vq.__path);
      for (const [k, v] of Object.entries(vq)) {
        if (k !== '__path' && typeof v === 'string' && !extraParams.has(k)) {
          extraParams.set(k, v);
        }
      }
    }
  }

  if (path) {
    const rest = extraParams.toString();
    req.url = '/api/' + path + (rest ? '?' + rest : '');
  }

  // 记录最终状态到 Vercel Function Logs
  console.log(JSON.stringify({ rawUrl, restoredUrl: req.url, path }));

  // ---- 交给 NestJS ----
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    console.error('[api/index] error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
