#!/bin/bash
# 修复 Vercel 部署所需的依赖

echo "🔧 安装 Vercel 部署所需依赖..."

# Vercel 相关
npm install @vercel/postgres @vercel/blob

# 文件上传
npm install multer @nestjs/platform-express
npm install -D @types/multer

# AWS S3 (可选)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 其他可能缺失的依赖
npm install uuid
npm install -D @types/uuid

echo "✅ 依赖安装完成！"
echo ""
echo "接下来运行："
echo "  npm run dev      # 本地开发"
echo "  vercel          # 部署到 Vercel"
