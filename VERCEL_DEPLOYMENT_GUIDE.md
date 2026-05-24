# Vercel 全球部署指南

本指南将带你一步步将 AI 换装项目部署到 Vercel，实现全球访问。

## 为什么选择 Vercel

- 全球 CDN 分发，访问速度快
- 自动 HTTPS 和域名管理
- 免费额度足够个人使用
- 与 GitHub 集成，自动部署
- Serverless 函数自动扩缩容

## 架构限制与解决方案

| Vercel 限制 | 解决方案 |
|-------------|----------|
| 无本地文件系统 | 使用 Vercel Blob Storage |
| 无持久化数据库 | 使用 Vercel Postgres (Neon) |
| 函数执行时间 60s | 使用流式响应处理长时间 AI 请求 |
| 无 WebSocket | 使用 HTTP 轮询或 SSE |

---

## 第一步：准备云服务账号

### 1.1 创建 Vercel 账号
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 安装 Vercel GitHub App

### 1.2 注册所需服务

#### Vercel Postgres (数据库)
- 在 Vercel 项目设置中添加 Postgres
- 免费额度：60 小时计算时间/月
- 自动备份和扩展

#### Vercel Blob Storage (图片存储)
- 在 Vercel 项目设置中添加 Blob
- 免费额度：500GB 存储传输
- 全球 CDN 加速

#### AI 服务（选择其一）

**推荐方案对比**:

| 服务 | 图片生成 | 文本生成 | 免费额度 | 价格 | 推荐度 |
|------|----------|----------|----------|------|--------|
| OpenAI | DALL-E 3 | GPT-4 | $5 新用户 | $0.04/图 | ⭐⭐⭐⭐⭐ |
| Replicate | 多模型 | 多模型 | 无 | 按秒计费 | ⭐⭐⭐⭐ |
| Together AI | Stable Diffusion | 多模型 | $25 免费额度 | $0.002/图 | ⭐⭐⭐⭐⭐ |

**推荐：Together AI** - 性价比最高，支持 Stable Diffusion 换装

---

## 第二步：本地代码改造

### 2.1 安装 Vercel 依赖

```bash
# 安装 Vercel 适配器
npm install @vercel/postgres @vercel/blob
npm install -D @vercel/nuxt
```

### 2.2 创建 Vercel 配置文件

创建 [vercel.json](vercel.json):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### 2.3 修改数据库配置

创建 [server/database/config.vercel.ts](server/database/config.vercel.ts):

```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

export const db = drizzle(sql);
```

更新 [server/database/schema.ts](server/database/schema.ts):

```typescript
import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const history = pgTable("history", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  userId: varchar({ length: 255 }).notNull(),
  originalPhotoUrl: text().notNull(),
  clothingPhotoUrl: text().notNull(),
  resultPhotoUrl: text(),
  styleSuggestion: text(),
  status: varchar({ length: 50 }).default('pending').notNull(),
  createdAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_history_user_id").on(table.userId),
]);
```

### 2.4 创建图片上传服务

创建 [server/modules/upload/blob.service.ts](server/modules/upload/blob.service.ts):

```typescript
import { Injectable } from '@nestjs/common';
import { put, del } from '@vercel/blob';

@Injectable()
export class BlobService {
  async uploadImage(
    file: File | Buffer,
    filename: string
  ): Promise<{ url: string; key: string }> {
    const blob = await put(filename, file, {
      access: 'public',
    });

    return {
      url: blob.url,
      key: blob.url,
    };
  }

  async deleteImage(url: string): Promise<void> {
    await del(url);
  }

  async uploadFromUrl(url: string, filename: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await this.uploadImage(buffer, filename);
    return result.url;
  }
}
```

### 2.5 创建 AI 服务

创建 [server/modules/ai/together-ai.service.ts](server/modules/ai/together-ai.service.ts):

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TogetherAIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.together.xyz/v1';

  constructor() {
    this.apiKey = process.env.TOGETHER_API_KEY!;
  }

  async generateVirtualTryon(
    personImageUrl: string,
    clothingImageUrl: string
  ): Promise<string> {
    // 使用 Together AI 的 Stable Diffusion 换装模型
    const response = await axios.post(
      `${this.baseUrl}/images/generations`,
      {
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        prompt: `virtual try-on, replace clothing with the style from the second image, keep facial features and body shape unchanged, professional photography, high quality`,
        image: personImageUrl,
        control_image: clothingImageUrl,
        num_images: 1,
        width: 1024,
        height: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data[0].url;
  }

  async generateStyleSuggestion(
    userDemand: string,
    onChunk?: (text: string) => void
  ): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的穿搭顾问。请从风格定位、搭配技巧、适配场景三个维度给出建议，总字数控制在300字以内。',
          },
          {
            role: 'user',
            content: userDemand,
          },
        ],
        stream: !!onChunk,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: onChunk ? 'stream' : 'json',
      }
    );

    if (onChunk && response.data) {
      let fullText = '';
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullText += content;
                onChunk(fullText);
              }
            } catch {}
          }
        }
      });
      return fullText;
    }

    return response.data.choices[0].message.content;
  }
}
```

### 2.6 修改主入口适配 Vercel

创建 [api/index.ts](api/index.ts):

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../server/app.module';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function bootstrap() {
  if (!app) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp)
    );
    await nestApp.init();
    app = expressApp;
  }
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const app = await bootstrap();
  app(req, res);
}
```

### 2.7 更新前端 API 调用

修改 [client/src/utils/outfit-plugins.ts](client/src/utils/outfit-plugins.ts):

```typescript
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = '/api'; // Vercel 会自动代理

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE}/ai/tryon`, {
      personImageUrl,
      clothingImageUrl,
    });
    return response.data.imageUrl;
  } catch (error) {
    toast.error('AI 换装失败，请重试');
    throw error;
  }
}

export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE}/ai/suggestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userDemand }),
  });

  if (!response.ok) throw new Error('生成建议失败');

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) throw new Error('No response');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.content;
          if (content) {
            fullText += content;
            onChunk(fullText);
          }
        } catch {}
      }
    }
  }

  return fullText;
}
```

修改 [client/src/pages/HomePage/HomePage.tsx](client/src/pages/HomePage/HomePage.tsx) 中的上传部分:

```typescript
// 替换 UploadCard 组件中的 onDrop 函数
const onDrop = useCallback(async (acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('上传失败');

    const data = await response.json();
    onUpload(data.url);
    toast.success(`${label}上传成功`);
  } catch (err) {
    logger.error("图片上传失败", err);
    toast.error("图片上传失败，请重试");
  }
}, [label, onUpload]);
```

---

## 第三步：部署到 Vercel

### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3.2 登录 Vercel

```bash
vercel login
```

### 3.3 部署项目

```bash
# 第一次部署，选择以下配置：
# - Link to existing project? No
# - Project name: ai-outfit (或你喜欢的名字)
# - In which directory is your code located? ./
# - Override settings? Yes

vercel
```

### 3.4 配置环境变量

在 Vercel 控制台设置以下环境变量：

```env
# Vercel 自动提供（无需手动设置）
POSTGRES_URL=xxx
POSTGRES_PRISMA_URL=xxx
BLOB_READ_WRITE_TOKEN=xxx

# AI 服务（需要手动添加）
TOGETHER_API_KEY=your_together_api_key_here
# 或使用 OpenAI
# OPENAI_API_KEY=your_openai_api_key_here
```

### 3.5 配置 Vercel Postgres

1. 在 Vercel 项目中，进入 Storage 标签
2. 点击 "Create Database"
3. 选择 "Postgres" → "Continue"
4. 选择区域（推荐：Singapore 亚洲区域）
5. 点击 "Create"

### 3.6 配置 Vercel Blob

1. 在 Vercel 项目中，进入 Storage 标签
2. 点击 "Create Database"
3. 选择 "Blob" → "Continue"
4. 点击 "Create"

### 3.7 运行数据库迁移

```bash
# 连接到 Vercel Postgres 并创建表
vercel env pull .env.local
npm run db:migrate
```

---

## 第四步：配置域名（可选）

### 4.1 添加自定义域名

1. 在 Vercel 项目设置中，进入 "Domains"
2. 添加你的域名（如：ai-outfit.com）
3. 按照提示配置 DNS 记录

### 4.2 DNS 配置

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 部署检查清单

- [ ] Vercel Postgres 已创建并连接
- [ ] Vercel Blob Storage 已创建
- [ ] AI 服务 API Key 已配置
- [ ] 数据库迁移已执行
- [ ] 图片上传功能测试通过
- [ ] AI 换装功能测试通过
- [ ] 自定义域名已配置（可选）

---

## 文件修改汇总

### 需要修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| [vercel.json](vercel.json) | 新建 | Vercel 配置 |
| [api/index.ts](api/index.ts) | 新建 | Vercel 函数入口 |
| [server/database/config.vercel.ts](server/database/config.vercel.ts) | 新建 | Vercel Postgres 配置 |
| [server/modules/upload/blob.service.ts](server/modules/upload/blob.service.ts) | 新建 | Blob 存储服务 |
| [server/modules/ai/together-ai.service.ts](server/modules/ai/together-ai.service.ts) | 新建 | AI 服务 |
| [client/src/utils/outfit-plugins.ts](client/src/utils/outfit-plugins.ts) | 修改 | API 调用适配 |
| [client/src/pages/HomePage/HomePage.tsx](client/src/pages/HomePage/HomePage.tsx) | 修改 | 上传逻辑 |

### 需要删除的文件

- `client/src/components/business-ui/` 中的飞书相关组件
- `server/capabilities/` 中的豆包插件配置
- 移除 `@lark-apaas/*` 相关依赖

---

## 费用估算

### 免费额度下（月）

| 服务 | 免费额度 | 预计用量 | 是否够用 |
|------|----------|----------|----------|
| Vercel 托管 | 100GB 带宽 | ~10GB | ✅ 足够 |
| Vercel Postgres | 60h 计算时间 | ~5h | ✅ 超够 |
| Vercel Blob | 500GB 存储 | ~1GB | ✅ 超够 |
| Together AI | $25 额度 | ~$10-15 | ✅ 够用 |

**总费用：$0/月（使用免费额度）**

---

## 故障排查

### 问题 1：函数超时
**解决方案**：使用异步处理 + 轮询

```typescript
// 提交任务后立即返回 jobId
const { jobId } = await api.submitTask();

// 轮询查询结果
const result = await pollTaskResult(jobId);
```

### 问题 2：图片上传失败
**解决方案**：增加文件大小限制

```typescript
// vercel.json
{
  "functions": {
    "api/upload/image.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### 问题 3：跨域问题
**解决方案**：配置 CORS

```typescript
// server/main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});
```

---

## 下一步

部署完成后，你可以：

1. **监控性能**：在 Vercel Analytics 中查看访问数据
2. **优化速度**：配置全球边缘网络缓存
3. **添加日志**：集成 Vercel Logs 查看错误
4. **A/B 测试**：测试不同的 AI 模型效果

需要帮助？查看 [Vercel 文档](https://vercel.com/docs)
