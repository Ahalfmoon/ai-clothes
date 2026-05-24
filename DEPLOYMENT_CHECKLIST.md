# Vercel 部署清单

按照此清单一步步完成部署，确保不遗漏任何步骤。

## 准备工作

### 1. 注册账号
- [ ] 注册 [Vercel 账号](https://vercel.com/signup)（使用 GitHub 登录）
- [ ] 注册 [Together AI 账号](https://together.ai/)（获取 $25 免费额度）

### 2. 获取 API Key
- [ ] 登录 Together AI，复制 API Key
- [ ] 保存 API Key，稍后配置

---

## 本地代码修改

### 3. 安装 Vercel 依赖
```bash
npm install @vercel/postgres @vercel/blob
npm install -D vercel @types/multer multer
```

### 4. 更新 package.json
确保你的 `package.json` 包含以下依赖：

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.9.0",
    "@vercel/blob": "^0.3.0",
    "drizzle-orm": "^0.44.6",
    "@nestjs/common": "^10.4.20",
    "@nestjs/core": "^10.4.20",
    "@nestjs/platform-express": "^10.4.20",
    "axios": "^1.12.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "vercel": "^37.0.0",
    "@types/multer": "^1.4.12"
  }
}
```

### 5. 创建 Vercel 配置文件
已为你创建 [vercel.json](vercel.json)，确认以下配置：
- [ ] API 函数超时时间设置为 60 秒
- [ ] API 路由重写配置正确
- [ ] CORS 头配置正确

### 6. 添加新模块
已为你创建以下文件，确认它们存在：
- [ ] [api/index.ts](api/index.ts) - Vercel 函数入口
- [ ] [server/modules/upload/upload.controller.ts](server/modules/upload/upload.controller.ts)
- [ ] [server/modules/upload/upload.module.ts](server/modules/upload/upload.module.ts)
- [ ] [server/modules/upload/blob.service.ts](server/modules/upload/blob.service.ts)
- [ ] [server/modules/ai/ai.controller.ts](server/modules/ai/ai.controller.ts)
- [ ] [server/modules/ai/ai.module.ts](server/modules/ai/ai.module.ts)
- [ ] [server/modules/ai/together-ai.service.ts](server/modules/ai/together-ai.service.ts)

### 7. 更新主模块
将 [server/app.module.ts](server/app.module.ts) 替换为：
- [ ] 已添加 `UploadModule`
- [ ] 已添加 `AIModule`
- [ ] 已添加 `ConfigModule`

### 8. 更新前端代码
修改以下文件以适配新 API：
- [ ] [client/src/utils/outfit-plugins.ts](client/src/utils/outfit-plugins.ts) - 更新 API 调用
- [ ] [client/src/pages/HomePage/HomePage.tsx](client/src/pages/HomePage/HomePage.tsx) - 更新上传逻辑

### 9. 移除飞书依赖
```bash
npm uninstall @lark-apaas/client-toolkit @lark-apaas/fullstack-nestjs-core @official-plugins/ai-image-to-image @official-plugins/ai-text-generate
```

### 10. 更新数据库 Schema
使用 [server/database/schema.vercel.ts](server/database/schema.vercel.ts) 中的简化版本

---

## Vercel 平台配置

### 11. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 12. 登录 Vercel
```bash
vercel login
```

### 13. 初始化项目
```bash
# 在项目根目录执行
vercel link
```

按照提示：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账号
- Link to existing project? → **N**
- Project name? → **ai-outfit**
- Directory? → **./**

### 14. 配置环境变量
在 Vercel 控制台添加以下环境变量：

```
Settings → Environment Variables → Add New
```

- [ ] `TOGETHER_API_KEY` = 你的 Together AI API Key
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOWED_ORIGINS` = 你的域名（或留空使用通配符）

### 15. 启用 Vercel Postgres
```
Storage → Create Database → Postgres → Continue
```

- [ ] 数据库区域选择 **Singapore**（亚洲区域访问更快）
- [ ] 创建后自动设置以下环境变量：
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`

### 16. 启用 Vercel Blob
```
Storage → Create Database → Blob → Continue
```

- [ ] 创建后自动设置 `BLOB_READ_WRITE_TOKEN` 环境变量

### 17. 运行数据库迁移
```bash
# 拉取 Vercel 环境变量
vercel env pull .env.local

# 运行迁移（需要先创建迁移脚本）
npm run db:migrate:prod
```

---

## 部署

### 18. 首次部署
```bash
vercel --prod
```

### 19. 等待部署完成
- [ ] 在 Vercel 控制台查看部署进度
- [ ] 确认没有错误信息

### 20. 测试功能
访问部署后的 URL（通常是 `https://ai-outfit.vercel.app`）：

- [ ] 主页可以正常打开
- [ ] 图片上传功能正常
- [ ] AI 换装功能正常
- [ ] 穿搭建议生成正常
- [ ] 历史记录保存正常

---

## 部署后配置

### 21. 配置自定义域名（可选）
```
Settings → Domains → Add Domain
```

- [ ] 添加你的域名
- [ ] 配置 DNS 记录
- [ ] 等待 SSL 证书生成

### 22. 启用分析（可选）
```
Analytics → Enable
```

### 23. 配置日志（可选）
```
Logs → Enable
```

---

## 验证清单

### 功能验证
- [ ] 上传人物照片成功
- [ ] 上传服装照片成功
- [ ] 点击"一键换装"按钮有响应
- [ ] 换装结果图片正常显示
- [ ] 穿搭建议文字正常显示
- [ ] 历史记录页面可以查看
- [ ] 历史记录可以删除

### 性能验证
- [ ] 页面加载时间 < 3 秒
- [ ] 图片上传时间 < 5 秒
- [ ] AI 换装生成有进度提示

### 安全验证
- [ ] API Key 没有暴露在前端
- [ ] 环境变量正确配置
- [ ] CORS 配置正确

---

## 故障排查

### 如果部署失败
1. 检查 Vercel 部署日志
2. 检查环境变量是否全部配置
3. 检查数据库迁移是否成功

### 如果图片上传失败
1. 检查 Blob Storage 是否启用
2. 检查 `BLOB_READ_WRITE_TOKEN` 是否配置

### 如果 AI 换装失败
1. 检查 `TOGETHER_API_KEY` 是否正确
2. 检查 API 额度是否用完
3. 查看 AI 服务的错误日志

### 如果数据库错误
1. 检查 Postgres 是否启用
2. 检查 `POSTGRES_URL` 是否配置
3. 确认表已创建

---

## 费用监控

在 Vercel 控制台监控：
- [ ] 带宽使用量
- [ ] 函数执行时间
- [ ] 存储使用量

Together AI 控制台监控：
- [ ] API 调用次数
- [ ] 费用使用情况

---

## 下一步

部署成功后，你可以：
1. 添加更多 AI 模型选项
2. 优化 UI/UX 设计
3. 添加用户认证
4. 实现社交分享功能
5. 添加支付功能（使用 Stripe）

---

## 需要帮助？

- [Vercel 文档](https://vercel.com/docs)
- [Together AI 文档](https://docs.together.ai)
- [项目部署指南](VERCEL_DEPLOYMENT_GUIDE.md)
