# 快速开始：5 分钟部署到 Vercel

这是一个简化的部署指南，帮你快速将 AI 换装应用部署到 Vercel。

## 前置要求

1. GitHub 账号
2. Vercel 账号（用 GitHub 登录）
3. Together AI 账号（获取免费 API 额度）

---

## 第一步：获取 API Key（2 分钟）

1. 访问 [together.ai](https://together.ai)
2. 注册账号
3. 进入 Settings → API Keys
4. 复制你的 API Key

---

## 第二步：准备代码（2 分钟）

### 2.1 安装依赖
```bash
npm install @vercel/postgres @vercel/blob
npm install -D vercel
```

### 2.2 复制适配文件

我已为你创建了 Vercel 适配的文件，按以下方式替换：

| 原文件 | 替换为 |
|--------|--------|
| [client/src/utils/outfit-plugins.ts](client/src/utils/outfit-plugins.ts) | [client/src/utils/outfit-plugins.vercel.ts](client/src/utils/outfit-plugins.vercel.ts) |
| [client/src/pages/HomePage/HomePage.tsx](client/src/pages/HomePage/HomePage.tsx) | [client/src/pages/HomePage/HomePage.vercel.tsx](client/src/pages/HomePage/HomePage.vercel.tsx) |
| [server/app.module.ts](server/app.module.ts) | [server/app.module.vercel.ts](server/app.module.vercel.tsx) |

### 2.3 添加新文件
确保这些文件存在于项目中：
- [vercel.json](vercel.json) ✅
- [api/index.ts](api/index.ts) ✅
- [server/modules/upload/upload.controller.ts](server/modules/upload/upload.controller.ts) ✅
- [server/modules/upload/upload.module.ts](server/modules/upload/upload.module.ts) ✅
- [server/modules/upload/blob.service.ts](server/modules/upload/blob.service.ts) ✅
- [server/modules/ai/ai.controller.ts](server/modules/ai/ai.controller.ts) ✅
- [server/modules/ai/ai.module.ts](server/modules/ai/ai.module.ts) ✅
- [server/modules/ai/together-ai.service.ts](server/modules/ai/together-ai.service.ts) ✅

### 2.4 提交到 GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 第三步：部署到 Vercel（1 分钟）

### 3.1 连接 GitHub 仓库
1. 访问 [vercel.com/new](https://vercel.com/new)
2. 选择你的 GitHub 仓库
3. 点击 "Import"

### 3.2 配置项目
```
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: dist/client
Install Command: npm install
```

### 3.3 添加环境变量
在 Environment Variables 部分添加：
```
TOGETHER_API_KEY = 你的_API_Key
NODE_ENV = production
```

### 3.4 点击 Deploy
等待 2-3 分钟，部署完成！

---

## 第四步：启用服务（2 分钟）

### 4.1 启用 Vercel Postgres
1. 进入项目 → Storage
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 区域选择 "Singapore"
5. 点击 "Create"

### 4.2 启用 Vercel Blob
1. 进入项目 → Storage
2. 点击 "Create Database"
3. 选择 "Blob"
4. 点击 "Create"

### 4.3 重新部署
在 Vercel 控制台点击 "Redeploy"

---

## 第五步：测试功能

访问你的 Vercel 部署 URL（如 `https://ai-outfit.vercel.app`）

测试以下功能：
- ✅ 上传人物照片
- ✅ 上传服装照片
- ✅ 点击"一键换装"
- ✅ 查看换装结果
- ✅ 阅读穿搭建议
- ✅ 查看历史记录

---

## 故障排查

### 部署失败
检查 [vercel.json](vercel.json) 配置是否正确

### 图片上传失败
确认 Blob Storage 已启用，检查 `BLOB_READ_WRITE_TOKEN` 环境变量

### AI 换装失败
确认 `TOGETHER_API_KEY` 正确配置，检查额度是否用完

### 数据库错误
确认 Postgres 已启用，检查表是否已创建

---

## 下一步

部署成功后：
1. 配置自定义域名
2. 优化页面标题和描述
3. 添加 Google Analytics
4. 实现社交分享功能

---

## 需要详细文档？

查看完整指南：
- [Vercel 部署完整指南](VERCEL_DEPLOYMENT_GUIDE.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)
- [迁移指南](MIGRATION_GUIDE.md)
