# Vercel Blob 和 Postgres 配置指南

## 🎯 配置概述

本指南将帮助你配置 Vercel Blob（文件存储）和 Vercel Postgres（数据库），使你的 AI 换装应用完全运行在 Vercel 基础设施上。

---

## 📁 第一步：配置 Vercel Blob 文件存储

### 1.1 启用 Vercel Blob

1. **进入项目设置**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目 `ai-clothes`

2. **启用 Blob 存储**
   - 点击 **Settings** 标签
   - 在左侧菜单中找到 **Blob**
   - 点击 **Enable** 按钮

### 1.2 创建 Blob 访问令牌

1. **进入访问令牌页面**
   - 在 Blob 设置页面，点击 **Access Tokens**
   - 点击 **Create Token** 按钮

2. **配置令牌**
   - **Token name**: `read-write-token`
   - **Permissions**: 选择 **Read & Write**
   - 点击 **Create**

3. **复制令牌**
   - 创建后会显示类似 `vercel_blob_rw_...` 的令牌
   - **重要**: 只显示一次，请立即复制

### 1.3 添加环境变量

在 Vercel 项目设置中：

1. **进入环境变量设置**
   - 项目页面 → **Settings** → **Environment Variables**

2. **添加 Blob Token**
   - 点击 **Add New**
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: 粘贴刚才复制的令牌
   - **Environments**: 选择 **All** (Production, Preview, Development)
   - 点击 **Save**

### 1.4 本地开发配置

创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local

# 添加你的 Blob Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

---

## 🗄️ 第二步：配置 Vercel Postgres 数据库

### 2.1 创建 Postgres 数据库

1. **进入存储页面**
   - 在项目页面，点击 **Storage** 标签
   - 或者进入 **Settings** → **Database**

2. **创建数据库**
   - 点击 **Create Database** 按钮
   - 选择 **Postgres** 数据库
   - 选择区域：**Singapore**（亚洲用户推荐）
   - 点击 **Create**

### 2.2 自动配置的环境变量

创建完成后，Vercel 会自动设置以下环境变量：

```
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_HOST=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

**无需手动配置！**

### 2.3 创建数据库表

1. **进入数据库查询界面**
   - 在 Storage 页面，点击你的数据库名称
   - 点击 **Query** 标签

2. **执行 SQL 创建表**

点击 **New Query**，粘贴以下 SQL：

```sql
-- 创建历史记录表
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  original_photo_url TEXT NOT NULL,
  clothing_photo_url TEXT NOT NULL,
  result_photo_url TEXT,
  style_suggestion TEXT,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);

-- 验证表创建成功
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'history';
```

3. **点击 Execute** 执行 SQL

### 2.4 测试数据库连接

在 Query 页面测试插入数据：

```sql
-- 测试插入一条记录
INSERT INTO history (user_id, original_photo_url, clothing_photo_url, status)
VALUES ('test-user', 'https://example.com/person.jpg', 'https://example.com/cloth.jpg', 'success');

-- 查询记录
SELECT * FROM history;

-- 删除测试记录
DELETE FROM history WHERE user_id = 'test-user';
```

---

## 🔧 第三步：代码实现

### 3.1 Vercel Blob 服务

已创建 `server/modules/upload/vercel-blob.service.ts`：

```typescript
import { Injectable } from '@nestjs/common';
import { put, del } from '@vercel/blob';

@Injectable()
export class VercelBlobService {
  private readonly isEnabled: boolean;

  constructor() {
    // 检查是否配置了 Vercel Blob Token
    this.isEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;
  }

  async uploadImage(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    if (!this.isEnabled) {
      throw new Error('Vercel Blob is not configured');
    }

    const blob = await put(filename, file, { access: 'public' });
    return { url: blob.url, key: blob.url };
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Vercel Blob is not configured');
    }
    await del(url);
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}
```

### 3.2 数据库配置

已更新 `server/database/index.ts`：

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 优先使用 Vercel Postgres 环境变量
const connectionString =
  process.env.POSTGRES_URL ||           // Vercel Postgres (primary)
  process.env.POSTGRES_PRISMA_URL ||     // Vercel Postgres Prisma URL
  process.env.DATABASE_URL ||            // Custom DATABASE_URL
  'postgresql://postgres:postgres@localhost:5432/ai_outfit'; // Local

// Vercel serverless 需要单个连接
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

### 3.3 智能上传控制器

已更新 `upload.controller.ts`：

```typescript
// 自动选择存储后端：Vercel Blob 优先，本地存储备用
if (this.vercelBlobService.isConfigured()) {
  this.logger.log('Using Vercel Blob for upload');
  result = await this.vercelBlobService.uploadImage(file.buffer, filename);
} else {
  this.logger.log('Using local storage for upload');
  result = await this.blobService.uploadImage(file.buffer, filename);
}
```

---

## 🧪 第四步：测试配置

### 4.1 本地测试

```bash
# 设置环境变量
export BLOB_READ_WRITE_TOKEN=your_token_here
export POSTGRES_URL=your_database_url_here

# 启动应用
npm run dev

# 测试上传
curl -X POST http://localhost:3000/upload/image \
  -F "file=@test-image.jpg"

# 测试数据库
curl http://localhost:3000/history
```

### 4.2 Vercel 部署测试

```bash
# 提交代码
git add .
git commit -m "Add Vercel Blob and Postgres configuration"
git push origin main

# 重新部署
vercel --prod

# 测试部署
curl https://your-project.vercel.app/api/ai/health
```

---

## 📊 第五步：监控使用情况

### 5.1 查看 Blob 统计

1. 进入项目 → **Settings** → **Blob**
2. 查看：
   - **Total objects**: 文件总数
   - **Total size**: 总存储大小
   - **Bandwidth used**: 带宽使用量

### 5.2 查看 Postgres 统计

1. 进入项目 → **Storage** → 选择数据库
2. 查看：
   - **Query count**: 查询次数
   - **Storage used**: 存储使用量
   - **Rows read**: 读取行数

---

## 💰 费用说明

### Vercel Postgres 免费额度
- **Hobby 计划**: 免费
  - 60 小时计算时间/月
  - 512MB 存储
  - 10GB 数据传输/月

### Vercel Blob 免费额度
- **Hobby 计划**: 免费
  - 500GB 存储传输/月
  - 全球 CDN 加速
  - 无限文件数量

### 超出免费额度后
- **Postgres**: $0.35/GB 存储
- **Blob**: $0.15/GB 存储传输

---

## 🎯 总结

完成以上步骤后：

✅ **文件存储** - 图片自动上传到 Vercel Blob CDN  
✅ **数据库** - 历史记录存储在 Vercel Postgres  
✅ **全球加速** - 文件和数据全球分布  
✅ **自动扩展** - 无需手动配置服务器  
✅ **高可用性** - Vercel 基础设施保证  

**你的 AI 换装应用现在完全运行在 Vercel 上！** 🚀

---

## 🆘 故障排除

### 问题 1: Blob 上传失败
**错误**: `Vercel Blob is not configured`  
**解决**: 检查 `BLOB_READ_WRITE_TOKEN` 环境变量是否正确设置

### 问题 2: 数据库连接失败
**错误**: `Connection refused`  
**解决**: 确认在 Vercel Dashboard 中启用了 Postgres 服务

### 问题 3: 表不存在
**错误**: `relation "history" does not exist`  
**解决**: 在数据库 Query 页面执行创建表的 SQL

需要帮助？查看 [Vercel 文档](https://vercel.com/docs)