# AI 换装项目本地化迁移指南

本指南说明如何将项目从飞书平台迁移到本地化部署，包含三个核心部分的替换方案。

## 目录

1. [AI 换装 API 替换](#1-ai-换装-api-替换)
2. [数据库本地化替换](#2-数据库本地化替换)
3. [图片上传处理逻辑替换](#3-图片上传处理逻辑替换)

---

## 1. AI 换装 API 替换

### 当前实现

项目使用飞书平台的豆包插件进行 AI 换装：

**文件位置**: [client/src/utils/outfit-plugins.ts](client/src/utils/outfit-plugins.ts)

- **虚拟换装**: 使用 `@official-plugins/ai-image-to-image` 插件
- **穿搭建议**: 使用 `@official-plugins/ai-text-generate` 插件

**配置文件**:
- [server/capabilities/virtual_outfit_generation_1.json](server/capabilities/virtual_outfit_generation_1.json)
- [server/capabilities/outfit_suggestion_generate_1.json](server/capabilities/outfit_suggestion_generate_1.json)

### 替换方案

#### 方案 A: 使用 OpenAI DALL-E + GPT

```typescript
// client/src/utils/outfit-plugins.ts (修改后)
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  const response = await axios.post(`${API_BASE_URL}/api/outfit/generate`, {
    personImageUrl,
    clothingImageUrl,
  });
  return response.data.imageUrl;
}

export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/outfit/suggestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userDemand }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    fullText += text;
    onChunk(fullText);
  }

  return fullText;
}
```

**对应的后端实现**:

```typescript
// server/modules/outfit/outfit.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OutfitService } from './outfit.service';

@Controller('outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Post('generate')
  async generateImage(@Body() dto: GenerateOutfitDto) {
    return this.outfitService.generateImage(dto);
  }

  @Post('suggestion')
  async generateSuggestion(@Body() dto: SuggestionDto) {
    return this.outfitService.streamSuggestion(dto);
  }
}
```

```typescript
// server/modules/outfit/outfit.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OutfitService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateImage(dto: { personImageUrl: string; clothingImageUrl: string }) {
    // 使用 DALL-E 3 进行图片生成
    const response = await this.openai.images.edit({
      image: await this.fetchImage(dto.personImageUrl),
      prompt: `Replace the clothing in the person photo with the clothing style from the second image. Keep all facial features and body shape unchanged. Only replace the clothing.`,
      n: 1,
      size: "1024x1024",
    });

    return { imageUrl: response.data[0].url };
  }

  async streamSuggestion(dto: { userDemand: string }) {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的穿搭顾问。请从风格定位、搭配技巧、适配场景三个维度给出建议，总字数控制在300字以内。',
        },
        {
          role: 'user',
          content: dto.userDemand,
        },
      ],
      stream: true,
    });

    return stream; // 返回流式响应
  }

  private async fetchImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }
}
```

#### 方案 B: 使用 Stability AI

```typescript
// 使用 Stability AI 的 API
import axios from 'axios';

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  const response = await axios.post(
    'https://api.stability.ai/v2beta/stable-image/control/sketch',
    {
      image: personImageUrl,
      prompt: `Replace the clothing with style from reference image`,
      structure: clothingImageUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: 'image/*',
      },
      responseType: 'arraybuffer',
    }
  );

  // 将返回的图片上传到你的存储服务
  const uploadedUrl = await uploadImageToStorage(Buffer.from(response.data));
  return uploadedUrl;
}
```

#### 方案 C: 使用 Replicate API

```typescript
// 使用 Replicate 的虚拟换装模型
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  const output = await replicate.run(
    "timothyzhang/IDM-VTON:5016e2e6f1e196170dfb6c94bd847896d9b179217e94e0a6eb2c1d01e22296b2",
    {
      input: {
        human_img: personImageUrl,
        garm_img: clothingImageUrl,
        garment_des: "clothing image",
      }
    }
  );

  return output as string;
}
```

---

## 2. 数据库本地化替换

### 当前实现

项目使用飞书平台的 PostgreSQL 数据库：

**配置**: [server/database/schema.ts](server/database/schema.ts)
**连接**: 通过 `SUDA_DATABASE_URL` 环境变量
**ORM**: Drizzle ORM

### 替换方案

#### 方案 A: 本地 PostgreSQL + Drizzle ORM (推荐)

**安装依赖**:
```bash
npm install postgres drizzle-orm
```

**创建数据库配置**:

```typescript
// server/database/config.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_outfit';

export const client = postgres(connectionString);
export const db = drizzle(client);
```

**修改 schema 文件**:

```typescript
// server/database/schema.ts
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
  createdAt: timestamp().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp().default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("idx_history_user_id").on(table.userId),
]);
```

**创建数据库初始化脚本**:

```typescript
// server/database/migrate.ts
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './config';

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './server/database/migrations' });
  console.log('Migrations completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
```

**环境变量配置**:

```env
# .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_outfit
```

**生成迁移文件**:
```bash
npm install -D drizzle-kit
```

```json
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg --config=server/database/drizzle.config.ts",
    "db:migrate": "ts-node server/database/migrate.ts",
    "db:studio": "drizzle-kit studio --config=server/database/drizzle.config.ts"
  }
}
```

```typescript
// server/database/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### 方案 B: 使用 SQLite (适合开发/小规模部署)

**安装依赖**:
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

```typescript
// server/database/config.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('./ai-outfit.db');
export const db = drizzle(sqlite);
```

```typescript
// server/database/schema.ts (SQLite 版本)
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const history = sqliteTable("history", {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text().notNull(),
  originalPhotoUrl: text().notNull(),
  clothingPhotoUrl: text().notNull(),
  resultPhotoUrl: text(),
  styleSuggestion: text(),
  status: text().default('pending').notNull(),
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

#### 方案 C: 使用 MongoDB

**安装依赖**:
```bash
npm install mongoose
```

```typescript
// server/database/schema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IHistory extends Document {
  userId: string;
  originalPhotoUrl: string;
  clothingPhotoUrl: string;
  resultPhotoUrl?: string;
  styleSuggestion?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const HistorySchema = new Schema<IHistory>({
  userId: { type: String, required: true, index: true },
  originalPhotoUrl: { type: String, required: true },
  clothingPhotoUrl: { type: String, required: true },
  resultPhotoUrl: { type: String },
  styleSuggestion: { type: String },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const HistoryModel = mongoose.model<IHistory>('History', HistorySchema);
```

---

## 3. 图片上传处理逻辑替换

### 当前实现

项目使用飞书平台的 Dataloom 存储服务：

**文件位置**: [client/src/pages/HomePage/HomePage.tsx:45-62](client/src/pages/HomePage/HomePage.tsx#L45-L62)

```typescript
// 当前实现
const dataloom = await getDataloom();
const { data, error } = await dataloom.storage
  .from(getDefaultBucketId())
  .uploadFile(file);
```

### 替换方案

#### 方案 A: 使用本地文件系统存储

**安装 Multer**:
```bash
npm install @nestjs/platform-express multer
npm install -D @types/multer
```

**创建上传模块**:

```typescript
// server/modules/upload/upload.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(
          extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new Error('只支持图片格式 (jpeg, jpg, png, webp)'));
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
    };
  }
}
```

**配置静态文件服务**:

```typescript
// server/main.ts
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
```

**前端调用**:

```typescript
// client/src/utils/upload.ts
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('上传失败');
  }

  const data = await response.json();
  return data.url;
}
```

#### 方案 B: 使用 AWS S3

**安装依赖**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// server/modules/upload/s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET!;
  }

  async uploadFile(
    file: Express.Multer.File,
    key?: string
  ): Promise<{ url: string; key: string }> {
    const fileKey = key || `${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { url, key: fileKey };
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
```

**控制器**:

```typescript
// server/modules/upload/upload.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(
          extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new Error('只支持图片格式'));
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.uploadFile(file);
  }
}
```

#### 方案 C: 使用阿里云 OSS

```typescript
// server/modules/upload/oss.service.ts
import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';

@Injectable()
export class OSSService {
  private readonly client: OSS;

  constructor() {
    this.client = new OSS({
      region: process.env.ALIYUN_OSS_REGION!,
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID!,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET!,
      bucket: process.env.ALIYUN_OSS_BUCKET!,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    key?: string
  ): Promise<{ url: string; key: string }> {
    const fileKey = key || `outfit/${Date.now()}-${file.originalname}`;

    const result = await this.client.put(fileKey, file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
      },
    });

    return {
      url: result.url,
      key: fileKey,
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.client.signatureUrl(key, { expires: expiresIn });
  }
}
```

#### 方案 D: 使用 Cloudflare R2 (免费额度)

```typescript
// server/modules/upload/r2.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;
  }

  async uploadFile(
    file: Express.Multer.File,
    key?: string
  ): Promise<{ url: string; key: string }> {
    const fileKey = key || `outfit/${Date.now()}-${file.originalname}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return {
      url: `${this.publicUrl}/${fileKey}`,
      key: fileKey,
    };
  }
}
```

---

## 环境变量配置模板

创建 `.env.local` 文件:

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_outfit

# AI 服务配置 (选择其一)
# OpenAI
OPENAI_API_KEY=sk-xxx
# 或 Stability AI
STABILITY_API_KEY=sk-xxx
# 或 Replicate
REPLICATE_API_TOKEN=r8_xxx

# 对象存储配置 (选择其一)
# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=ai-outfit-bucket
AWS_REGION=us-east-1
# 或阿里云 OSS
ALIYUN_ACCESS_KEY_ID=xxx
ALIYUN_ACCESS_KEY_SECRET=xxx
ALIYUN_OSS_BUCKET=ai-outfit-bucket
ALIYUN_OSS_REGION=oss-cn-hangzhou
# 或 Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=ai-outfit
R2_PUBLIC_URL=https://your-domain.com

# 服务配置
SERVER_PORT=3000
BASE_URL=http://localhost:3000
```

---

## 迁移步骤总结

### 第一步: 设置本地数据库
1. 安装 PostgreSQL 或选择其他数据库方案
2. 配置数据库连接
3. 运行数据库迁移

### 第二步: 设置对象存储
1. 选择存储方案 (本地文件系统 / 云存储)
2. 配置上传接口
3. 测试文件上传功能

### 第三步: 替换 AI 服务
1. 选择 AI 服务提供商
2. 更新 API 调用代码
3. 测试换装生成功能

### 第四步: 更新前端代码
1. 移除飞书 SDK 依赖
2. 更新上传逻辑调用
3. 测试完整流程

---

## 推荐组合方案

### 开发环境
- **数据库**: SQLite
- **存储**: 本地文件系统
- **AI**: Replicate API (按需付费)

### 生产环境
- **数据库**: PostgreSQL (自托管或云服务)
- **存储**: Cloudflare R2 (免费额度大) 或阿里云 OSS
- **AI**: OpenAI DALL-E + GPT 或自建 Stable Diffusion
