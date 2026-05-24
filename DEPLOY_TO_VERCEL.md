# Vercel 部署完整指南

## ✅ 已修复的部署问题

### 最新修复（2026-05-24）
✅ **移除飞书 CLI 依赖**
- 删除了 `package.json` 中 `postinstall` 钩子的 `fullstack-cli` 命令
- 删除了 `gen:db-schema` 脚本中的飞书依赖
- 删除了 `actionPlugins` 配置块

✅ **安装 Vercel 依赖**
- 添加了 `@vercel/node` 包
- 创建了 `api/index.ts` 作为 serverless 函数入口

✅ **更新构建配置**
- 简化了 `package.json` scripts
- 修改了 `vercel.json` 配置以支持 NestJS

### 之前完成的改造
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

## 🚀 立即部署到 Vercel

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
git commit -m "Fix Vercel deployment: remove Feishu CLI dependencies"
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
- Project name? → **ai-clothes** (或自定义)
- Directory? → **./**
- Override settings? → **Y**

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
OPENAI_API_KEY=your_openai_key
```

#### 步骤 4: 启用 Vercel Postgres（可选）

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

#### 步骤 6: 验证部署

部署完成后访问：
- **主页面**: `https://your-project.vercel.app`
- **API 测试**: `https://your-project.vercel.app/api/ai/health`

测试 API：
```bash
curl https://your-project.vercel.app/api/ai/health
# 应返回: {"status":"ok","service":"Together AI"}
```

---

## 🔧 部署后升级（可选）

### 替换为 Vercel Blob Storage

创建 `server/modules/upload/vercel-blob.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class VercelBlobService {
  async uploadImage(file: Buffer, filename: string) {
    const blob = await put(filename, file, { access: 'public' });
    return { url: blob.url, key: blob.url };
  }

  async deleteImage(url: string) {
    await del(url);
  }
}
```

### 接入真实 AI 服务

使用 Together AI 或 OpenAI 替换 Mock 服务。

---

## 💰 费用说明

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

## 🐛 故障排查

### 问题 1: fullstack-cli 命令未找到
**状态**: ✅ 已修复
**解决**: 已移除所有飞书 CLI 依赖

### 问题 2: API 路由不工作
**解决**: 检查 `api/index.ts` 文件存在且正确
**解决**: 确认 `vercel.json` 配置正确

### 问题 3: 构建失败
**解决**: 检查 `package.json` scripts 是否正确
**解决**: 确认没有飞书相关的依赖引用

---

## 📋 当前功能状态

### ✅ 已实现（Mock）
- 图片上传（本地存储）
- AI 换装（返回目标图片）
- 穿搭建议（固定文本）
- 历史记录（数据库存储）

### 🔜 待升级（真实服务）
- Vercel Blob Storage（文件存储）
- Together AI/OpenAI（AI 换装）
- Together AI/OpenAI（穿搭建议）

---

## 🎯 下一步

1. ✅ 本地测试 Mock 版本
2. ✅ 修复 Vercel 部署问题
3. ⏳ 部署到 Vercel
4. ⏳ 启用 Vercel Postgres
5. ⏳ 替换为 Vercel Blob Storage
6. ⏳ 接入真实 AI 服务

需要帮助？查看 [Vercel 文档](https://vercel.com/docs)
