# Vercel 部署完整指南

## 已完成的改造

✅ **已移除飞书依赖**
- 卸载了所有 `@lark-apaas/*` 和 `@official-plugins/*` 包
- 修改了 `app.module.ts`、`main.ts`
- 修改了前端 `HomePage.tsx`、`outfit-plugins.ts`
- 修改了 `history.service.ts`
- 简化了 `database/schema.ts`

✅ **当前状态**
- 后端使用 NestJS + Mock AI 服务
- 前端使用 React + Vite
- 图片上传保存到本地 `uploads/` 目录
- AI 换装返回 Mock 数据

---

## 本地测试步骤

### 1. 启动后端（应已在运行）
```bash
# 后端已在后台运行
# 访问: http://localhost:3000
```

### 2. 启动前端（新开终端）
```bash
npm run dev:client
# 访问: http://localhost:5173
```

### 3. 测试功能
- 上传两张图片
- 点击"一键换装"
- 查看 Mock 结果

---

## 部署到 Vercel

### 准备工作

1. **注册账号**
   - [Vercel](https://vercel.com) - 使用 GitHub 登录
   - [Together AI](https://together.ai) - 获取 $25 免费额度（可选）

2. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **登录 Vercel**
   ```bash
   vercel login
   ```

### 部署步骤

#### 步骤 1: 提交代码到 GitHub
```bash
git add .
git commit -m "Remove Feishu dependencies, prepare for Vercel"
git push origin main
```

#### 步骤 2: 创建 Vercel 项目
```bash
vercel
```

按提示操作：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账号
- Link to existing project? → **N**
- Project name? → **ai-outfit**
- Directory? → **./**

#### 步骤 3: 配置环境变量

在 Vercel 控制台添加以下环境变量：

```
Settings → Environment Variables → Add New
```

必需的环境变量：
```env
NODE_ENV=production
```

可选（如果要使用真实 AI）：
```env
TOGETHER_API_KEY=your_together_ai_key
```

#### 步骤 4: 启用 Vercel Postgres

1. 进入项目 → **Storage**
2. 点击 **Create Database**
3. 选择 **Postgres**
4. 区域选择 **Singapore**（亚洲更快）
5. 点击 **Create**

这会自动设置：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`

#### 步骤 5: 创建数据库表

在 Vercel 控制台的 Postgres 页面，点击 **Query**，执行：

```sql
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

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
```

#### 步骤 6: 更新代码使用 Vercel 服务

部署后，需要更新以下文件：

**1. 替换 Blob Service 为 Vercel Blob**

创建 `vercel-blob.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class BlobService {
  async uploadImage(file: Buffer, filename: string) {
    const blob = await put(filename, file, { access: 'public' });
    return { url: blob.url, key: blob.url };
  }

  async deleteImage(url: string) {
    await del(url);
  }
}
```

**2. 更新 AI Service 为真实服务**

使用 Together AI 或其他服务。

#### 步骤 7: 重新部署

```bash
vercel --prod
```

---

## 费用说明

### Vercel 免费额度
- **Hobby 计划**: 免费
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS
  - 全球 CDN

### Vercel Postgres 免费额度
- **Hobby 计划**: 免费
  - 60 小时计算时间/月
  - 512MB 存储
  - 自动备份

### Vercel Blob 免费额度
- **Hobby 计划**: 免费
  - 500GB 存储传输/月
  - 全球 CDN

### 总成本: $0/月

超出免费额度后：
- Vercel Pro: $20/月
- Postgres: $0.35/GB
- Blob: $0.15/GB

---

## 当前 Mock 版本功能

### 本地可以测试：
✅ 上传图片到本地
✅ 显示上传进度
✅ Mock AI 换装（返回目标图）
✅ Mock 穿搭建议（固定文本）
✅ 历史记录（需要数据库）

### 部署到 Vercel 后需要：
❌ 使用 Vercel Blob Storage
❌ 使用真实 AI 服务
❌ 使用 Vercel Postgres

---

## 快速验证部署

部署完成后访问：
- **主页面**: `https://ai-outfit.vercel.app`
- **API 测试**: `https://ai-outfit.vercel.app/api/ai/health`

测试 API：
```bash
curl https://ai-outfit.vercel.app/api/ai/health
# 应返回: {"status":"ok","service":"Together AI"}
```

---

## 故障排查

### 问题 1: 图片上传失败
**原因**: 本地使用文件系统，Vercel 需要 Blob Storage
**解决**: 更新 `blob.service.ts` 使用 `@vercel/blob`

### 问题 2: 数据库连接失败
**原因**: 环境变量未配置
**解决**: 确认在 Vercel 设置了 `POSTGRES_URL`

### 问题 3: AI 换装失败
**原因**: 当前使用 Mock 数据
**解决**: 配置 `TOGETHER_API_KEY` 或其他 AI 服务

---

## 下一步

1. ✅ 本地测试 Mock 版本
2. ✅ 部署到 Vercel
3. ✅ 启用 Vercel Postgres
4. ⏳ 替换为 Vercel Blob Storage
5. ⏳ 接入真实 AI 服务
6. ⏳ 测试完整功能

需要帮助？查看 [Vercel 文档](https://vercel.com/docs)
