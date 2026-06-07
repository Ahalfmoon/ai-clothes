# Vercel 完整配置指南

## 🚀 第一步：部署项目到 Vercel

### 1.1 准备工作
```bash
# 确保所有更改已提交
git add .
git commit -m "Fix Vercel deployment: remove all Feishu dependencies"
git push origin main
```

### 1.2 部署到 Vercel
```bash
# 安装 Vercel CLI（如未安装）
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

**按提示操作**:
- **Set up and deploy?** → `Y`
- **Which scope?** → 选择你的账号
- **Link to existing project?** → `N`
- **Project name?** → `ai-clothes`
- **In which directory?** → `.`
- **Override settings?** → `Y`

### 1.3 验证部署
```bash
# 测试 API 健康检查
curl https://your-project.vercel.app/api/ai/health
# 应返回: {"status":"ok","service":"Together AI"}
```

## 🗄️ 第二步：配置 Vercel Postgres 数据库

### 2.1 创建 Postgres 数据库

1. **进入 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目 `ai-clothes`

2. **进入存储页面**
   - 点击顶部导航的 **Storage** 标签
   - 或者进入 **Settings** → **Database**

3. **创建数据库**
   - 点击 **Create Database** 按钮
   - 选择 **Postgres** 数据库
   - 选择区域：**Singapore**（亚洲用户推荐）
   - 点击 **Create** 按钮

4. **等待创建完成**
   - Vercel 会自动创建数据库
   - 创建完成后会显示连接信息

### 2.2 获取数据库连接信息

创建完成后，Vercel 会自动设置以下环境变量：

```
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_HOST=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

这些环境变量会自动添加到你的项目中，无需手动配置。

### 2.3 创建数据库表

1. **进入数据库查询界面**
   - 在 Storage 页面，点击你的数据库名称
   - 点击 **Query** 标签
   - 或者点击 **Browse** 查看表结构

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

## 📁 第三步：配置 Vercel Blob 文件存储

### 3.1 启用 Blob 存储

1. **进入 Blob 设置**
   - 在项目页面，点击 **Settings** 标签
   - 在左侧菜单中找到 **Blob**
   - 点击 **Enable** 按钮

2. **创建存储桶**
   - Blob 启用后，会自动创建默认存储桶
   - 你可以创建多个存储桶来组织文件

### 3.2 获取 Blob Token

1. **进入访问令牌页面**
   - 在 Blob 设置页面，点击 **Access Tokens**
   - 点击 **Create Token**

2. **配置 Token**
   - **Token name**: `read-write-token`
   - **Permissions**: 选择 **Read & Write**
   - 点击 **Create**

3. **复制 Token**
   - 创建后会显示 Token 值
   - **重要**: 只显示一次，请立即复制

### 3.3 添加环境变量

在 Vercel 项目中添加 Blob 环境变量：

1. **进入环境变量设置**
   - 项目页面 → **Settings** → **Environment Variables**

2. **添加 Blob Token**
   - 点击 **Add New**
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: 粘贴刚才复制的 Token
   - **Environments**: 选择 **All** (Production, Preview, Development)
   - 点击 **Save**

### 3.4 更新代码使用 Blob 存储

创建 `server/modules/upload/vercel-blob.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class VercelBlobService {
  async uploadImage(file: Buffer, filename: string): Promise<{ url: string; key: string }> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
      });

      return {
        url: blob.url,
        key: blob.url,
      };
    } catch (error) {
      throw new Error(`Blob upload failed: ${error.message}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      throw new Error(`Blob delete failed: ${error.message}`);
    }
  }
}
```

## 🔧 第四步：更新项目配置

### 4.1 更新环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NODE_ENV=production
BLOB_READ_WRITE_TOKEN=你的Blob令牌
```

### 4.2 重新部署项目

```bash
# 提交代码更改
git add .
git commit -m "Add Vercel Postgres and Blob configuration"
git push origin main

# 重新部署到 Vercel
vercel --prod
```

## 🧪 第五步：测试完整功能

### 5.1 测试 API 端点

```bash
# 健康检查
curl https://your-project.vercel.app/api/ai/health

# AI 换装测试
curl -X POST https://your-project.vercel.app/api/ai/tryon \
  -H "Content-Type: application/json" \
  -d '{"personImageUrl":"https://example.com/person.jpg","clothingImageUrl":"https://example.com/cloth.jpg"}'

# 历史记录测试
curl https://your-project.vercel.app/api/history
```

### 5.2 测试前端功能

1. 访问 `https://your-project.vercel.app`
2. 测试图片上传功能
3. 测试 AI 换装功能
4. 测试历史记录功能

## 📊 第六步：监控和调试

### 6.1 查看 Vercel 日志

1. **进入项目页面**
   - 在 Vercel Dashboard 选择你的项目

2. **查看部署日志**
   - 点击 **Deployments** 标签
   - 选择一个部署，点击查看详细日志

3. **查看函数日志**
   - 点击 **Functions** 标签
   - 查看各个函数的调用日志和错误

### 6.2 查看数据库统计

1. **进入 Storage 页面**
   - 查看 **Query count** (查询次数)
   - 查看 **Storage used** (存储使用量)
   - 查看 **Rows read** (行读取数)

### 6.3 查看 Blob 统计

1. **进入 Blob 设置**
   - 查看 **Total objects** (总对象数)
   - 查看 **Total size** (总大小)
   - 查看 **Bandwidth used** (带宽使用)

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

### 超出免费额度后
- **Postgres**: $0.35/GB 存储
- **Blob**: $0.15/GB 存储传输

## 🎯 总结

完成以上步骤后，你的 AI 换装应用将：

✅ 部署在 Vercel 全球网络上
✅ 使用 Vercel Postgres 存储数据
✅ 使用 Vercel Blob 存储图片
✅ 支持全球用户快速访问
✅ 自动扩展处理高并发

需要帮助？查看：
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)
- [Vercel 部署文档](https://vercel.com/docs/deployments/overview)
