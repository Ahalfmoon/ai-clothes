import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';

@Controller()
export class ViewController {

  @Get('/')
  async render(@Req() req: Request, @Res() res: Response) {
    // 仅在生产环境渲染前端页面
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

    if (isProduction) {
      return res.render('index', {
        __platform__: '{}',
      });
    }

    // 开发环境：重定向到 Vite 开发服务器
    const vitePort = process.env.VITE_PORT || 5173;
    return res.redirect(`http://localhost:${vitePort}`);
  }

  // 处理前端路由（history 模式）
  @Get('*')
  async catchAll(@Req() req: Request, @Res() res: Response) {
    // 如果是 API 请求，跳过处理
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return res.status(404).end();
    }

    // 仅在生产环境渲染前端页面
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

    if (isProduction) {
      return res.render('index', {
        __platform__: '{}',
      });
    }

    // 开发环境：重定向到 Vite 开发服务器
    const vitePort = process.env.VITE_PORT || 5173;
    return res.redirect(`http://localhost:${vitePort}`);
  }
}
