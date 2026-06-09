/**
 * Vercel Serverless Function — 所有 /api/* 请求入口
 *
 * vercel.json rewrites: /api/upload/image → /api/index?__path=upload/image
 * 问题: req.url 被改写后，Express/NestJS 看到的是 /api/index?__path=...
 *      修改 req.url（赋值/Object.defineProperty）在 Vercel runtime 都可能不生效
 * 解决: 用 Proxy 包裹 req，拦截 url 属性读取，透传修复后的 URL
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  const { createApp } = require('../dist/server/main');
  const nestApp = await createApp();
  cachedApp = nestApp.getHttpAdapter().getInstance();
  return cachedApp;
}

/** 从 query 取 __path，构建修复后的 URL */
function buildRestoredUrl(rawUrl: string): string | null {
  const qi = rawUrl.indexOf('?');
  if (qi === -1) return null;
  const qp = new URLSearchParams(rawUrl.slice(qi + 1));
  const path = qp.get('__path');
  if (!path) return null;
  qp.delete('__path');
  const rest = qp.toString();
  return '/api/' + path + (rest ? '?' + rest : '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  // 诊断端点
  if (req.method === 'GET' && ((req.url || '/').split('?')[0] === '/api/ping')) {
    res.json({ ok: true, handler: 'working', rawUrl: req.url });
    return;
  }

  // 从 rewrite 后的 URL 提取原始路径
  const restoredUrl = buildRestoredUrl(req.url || '/');

  // 用 Proxy 包裹 req —— Express/NestJS 读 url 拿到的就是修复后的路径
  const wrappedReq = restoredUrl
    ? new Proxy(req, {
        get(target, prop, receiver) {
          if (prop === 'url') return restoredUrl;
          return Reflect.get(target, prop, receiver);
        },
      })
    : req;

  console.log(JSON.stringify({
    rawUrl: req.url,
    restoredUrl,
    finalUrl: restoredUrl || req.url,
  }));

  try {
    const app = await getApp();
    app(wrappedReq, res);
  } catch (error) {
    console.error('[api/index] error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
