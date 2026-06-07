# AI 换装 (ai-clothes)

AI 一键换装应用 — 上传自拍照和穿搭照，AI 生成虚拟换装效果和穿搭建议。

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| **框架** | [NestJS](https://nestjs.com) v10 | 后端服务框架，模块化架构 |
| **语言** | TypeScript 5.9 | 前后端统一类型系统 |
| **前端** | [React](https://react.dev) 19 + [Vite](https://vitejs.dev) 7 | SPA 应用构建 |
| **UI 样式** | [Tailwind CSS](https://tailwindcss.com) v4 | 原子化 CSS 框架 |
| **UI 组件** | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) | 无样式组件库，可定制 |
| **路由** | [React Router](https://reactrouter.com) v6 | 客户端路由 |
| **状态管理** | [Zustand](https://zustand.docs.pmnd.rs) v5 | 轻量级状态管理 |
| **HTTP 客户端** | [Axios](https://axios-http.com) | API 请求 |
| **表单** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | 表单验证 |
| **文件上传** | [React Dropzone](https://react-dropzone.js.org) | 拖拽上传 |
| **动画** | [Framer Motion](https://www.framer.com/motion) + [GSAP](https://gsap.com) | UI 动效 |
| **通知** | [Sonner](https://sonner.emilkowal.ski) | Toast 通知 |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | TypeScript 优先数据库 ORM |
| **数据库** | [Vercel Postgres](https://vercel.com/storage/postgres) (Neon) | 云端 PostgreSQL |
| **文件存储** | [Vercel Blob](https://vercel.com/storage/blob) | 云端对象存储 + CDN |
| **AI 服务** | Together AI / OpenAI (可配置) | AI 虚拟换装和穿搭建议 |
| **认证** | Mock 用户 | 待接入 Auth.js / Clerk |
| **部署** | [Vercel](https://vercel.com) | 全栈 Serverless 部署 |
| **图表** | [ECharts](https://echarts.apache.org) + [Recharts](https://recharts.org) | 数据可视化 |
| **富文本** | [Tiptap](https://tiptap.dev) + [Shiki](https://shiki.style) | 编辑器 + 语法高亮 |
| **图标** | [Lucide React](https://lucide.dev) | SVG 图标库 |

## 项目结构

```
ai-clothes/
├── client/                    # React 前端
│   └── src/
│       ├── api/               # API 调用层
│       ├── components/        # 通用组件 + UI 组件
│       │   └── ui/            # shadcn/ui 组件
│       ├── pages/             # 页面组件
│       │   ├── HomePage/      # 换装主页
│       │   ├── HistoryPage/   # 历史记录
│       │   └── NotFound/      # 404 页面
│       └── utils/             # 工具函数
├── server/                    # NestJS 后端
│   ├── modules/
│   │   ├── ai/                # AI 换装服务
│   │   ├── history/           # 历史记录服务
│   │   ├── upload/            # 图片上传服务
│   │   └── view/              # 视图渲染
│   ├── database/              # Drizzle ORM 配置
│   └── common/                # 公共过滤器/拦截器
├── shared/                    # 前后端共享类型
├── api/                       # Vercel Serverless 入口
└── dist/                      # 构建输出
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端同时）
npm run dev

# 浏览器访问
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

| 变量 | 必需 | 说明 |
|------|------|------|
| `DATABASE_URL` | 本地开发 | PostgreSQL 连接 URL |
| `BLOB_READ_WRITE_TOKEN` | Vercel | Blob 存储读写 Token |
| `TOGETHER_API_KEY` | 可选 | Together AI API Key |
| `OPENAI_API_KEY` | 可选 | OpenAI API Key |
| `ALLOWED_ORIGINS` | 可选 | CORS 允许的域名 |

## 部署

项目已配置为一键部署到 Vercel：

```bash
vercel
```

部署后在 Vercel Dashboard 中启用 Postgres 和 Blob 服务即可。

详细步骤见 [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md)。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/ai/health` | AI 服务健康检查 |
| `POST` | `/api/ai/tryon` | AI 虚拟换装 |
| `POST` | `/api/ai/suggestion` | 穿搭建议生成 |
| `POST` | `/api/upload/image` | 图片上传 |
| `GET` | `/api/history` | 历史记录列表 |
| `POST` | `/api/history` | 创建历史记录 |
| `DELETE` | `/api/history/:id` | 删除历史记录 |

## License

MIT
