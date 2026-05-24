@echo off
REM 修复 Vercel 部署所需的依赖 (Windows)

echo 🔧 安装 Vercel 部署所需依赖...

REM Vercel 相关
call npm install @vercel/postgres @vercel/blob

REM 文件上传
call npm install multer @nestjs/platform-express
call npm install -D @types/multer

REM AWS S3 (可选)
call npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

REM 其他可能缺失的依赖
call npm install uuid
call npm install -D @types/uuid

echo ✅ 依赖安装完成！
echo.
echo 接下来运行：
echo   npm run dev      # 本地开发
echo   vercel          # 部署到 Vercel

pause
