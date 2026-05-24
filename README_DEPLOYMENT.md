# AI 换装项目 - 部署文档索引

本项目提供了完整的部署指南，帮助你将应用从飞书平台迁移到 Vercel 全球部署。

## 📚 文档导航

### 快速开始
- **[QUICK_START.md](QUICK_START.md)** - 5 分钟快速部署指南
  - 适合第一次部署
  - 最简化的步骤
  - 包含故障排查

### Vercel 部署
- **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** - Vercel 完整部署指南
  - 详细的架构说明
  - 逐步的配置教程
  - 费用估算和优化建议
  - 故障排查方案

- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 部署检查清单
  - 完整的部署步骤清单
  - 可以逐项勾选
  - 确保不遗漏任何步骤

### 通用迁移指南
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - 本地化迁移指南
  - 多种 AI 服务方案对比
  - 多种数据库方案对比
  - 多种存储方案对比

---

## 🚀 推荐部署流程

### 如果是第一次部署
1. 阅读 [QUICK_START.md](QUICK_START.md)
2. 按步骤执行
3. 遇到问题查看故障排查部分

### 如果需要详细配置
1. 阅读 [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
2. 使用 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) 跟踪进度
3. 遇到问题查看故障排查部分

### 如果想替换服务提供商
1. 阅读 [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
2. 选择适合的方案
3. 按照指南修改代码

---

## 📁 项目文件说明

### Vercel 配置文件
- `vercel.json` - Vercel 平台配置
- `api/index.ts` - Vercel 函数入口点

### 后端适配文件
- `server/database/config.vercel.ts` - Vercel Postgres 配置
- `server/database/schema.vercel.ts` - 简化的数据库 Schema
- `server/app.module.vercel.ts` - 包含新模块的主模块
- `server/modules/upload/` - 文件上传模块
- `server/modules/ai/` - AI 服务模块

### 前端适配文件
- `client/src/utils/outfit-plugins.vercel.ts` - Vercel API 调用
- `client/src/pages/HomePage/HomePage.vercel.tsx` - 移除 Dataloom 依赖

### 环境变量
- `.env.example` - 环境变量模板

---

## 🔧 需要修改的文件

部署前需要替换以下文件：

| 文件 | 替换为 | 说明 |
|------|--------|------|
| `client/src/utils/outfit-plugins.ts` | `outfit-plugins.vercel.ts` | 移除飞书 SDK |
| `client/src/pages/HomePage/HomePage.tsx` | `HomePage.vercel.tsx` | 更新上传逻辑 |
| `server/app.module.ts` | `app.module.vercel.ts` | 添加新模块 |

---

## 🆚 服务对比

### AI 服务推荐

| 服务 | 价格 | 优势 | 推荐场景 |
|------|------|------|----------|
| Together AI | $0.002/图 | $25 免费额度，便宜 | 个人项目 ⭐ |
| OpenAI | $0.04/图 | 稳定可靠，质量高 | 生产环境 |
| Replicate | 按秒计费 | 支持多种模型 | 测试不同模型 |

### 数据库推荐

| 数据库 | 价格 | 优势 | 推荐场景 |
|--------|------|------|----------|
| Vercel Postgres | $0/60h | 无需管理，自动备份 | Vercel 部署 ⭐ |
| Supabase | $0/500MB | 开源，功能丰富 | 需要更多功能 |
| Neon | $0/3 项目 | Serverless，快速 | 开发测试 |

### 存储推荐

| 存储 | 价格 | 优势 | 推荐场景 |
|------|------|------|----------|
| Vercel Blob | $0/500GB | 与 Vercel 集成好 | Vercel 部署 ⭐ |
| Cloudflare R2 | $0/10GB | 免费额度大 | 个人项目 |
| AWS S3 | $0.023/GB | 成熟稳定 | 大规模项目 |

---

## 💰 费用估算

### 免费额度下的月度成本

| 服务 | 免费额度 | 预计用量 | 实际费用 |
|------|----------|----------|----------|
| Vercel 托管 | 100GB 带宽 | ~10GB | $0 |
| Vercel Postgres | 60h 计算 | ~5h | $0 |
| Vercel Blob | 500GB 存储 | ~1GB | $0 |
| Together AI | $25 额度 | ~$10-15 | $0 |

**总费用：$0/月**（使用免费额度）

超出免费额度后：
- Vercel: ~$20/月
- Postgres: ~$0.35/GB
- Together AI: ~$10-20/月（取决于用量）

---

## 🌍 全球部署架构

```
┌─────────────────────────────────────────────────┐
│                   用户请求                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │   Vercel Edge   │
        │   全球 CDN 网络   │
        └────────┬─────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│上传图片 │  │ AI 换装 │  │ 数据存储 │
│ Blob   │  │Together │  │ Postgres │
└────────┘  └─────────┘  └──────────┘
```

---

## 📞 获取帮助

- Vercel 文档：https://vercel.com/docs
- Together AI 文档：https://docs.together.ai
- Drizzle ORM：https://orm.drizzle.team

---

## 📋 部署前检查

在部署前，请确认：

- [ ] 已安装所有依赖
- [ ] 已替换所有必要的文件
- [ ] 已获取 Together AI API Key
- [ ] 代码已提交到 GitHub
- [ ] 已阅读快速开始指南

---

## ✅ 部署成功后

恭喜！你的应用现在全球可访问。

接下来你可以：
1. 配置自定义域名
2. 设置 Google Analytics
3. 优化 SEO
4. 添加更多功能
5. 监控性能和费用

---

**祝你部署顺利！** 🎉
