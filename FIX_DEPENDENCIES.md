# 🔧 依赖修复指南

运行以下命令安装缺失的依赖：

## 一键安装（推荐）

```bash
npm install @vercel/postgres @vercel/blob multer @nestjs/platform-express @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid @types/multer @types/uuid -D
```

## 或者分步安装

```bash
# Vercel 服务
npm install @vercel/postgres @vercel/blob

# 文件上传
npm install multer @nestjs/platform-express
npm install -D @types/multer

# 工具库
npm install uuid
npm install -D @types/uuid

# AWS S3 (可选)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Windows 用户

直接双击运行：
```
scripts\fix-deps.bat
```

## Mac/Linux 用户

运行：
```bash
bash scripts/fix-deps.sh
```

---

## 安装后验证

运行以下命令检查是否有错误：
```bash
npm run type:check
```

---

## 常见错误解决

### 错误: Cannot find module '@vercel/postgres'
```bash
npm install @vercel/postgres
```

### 错误: Cannot find module 'multer'
```bash
npm install multer @nestjs/platform-express
npm install -D @types/multer
```

### 错误: Cannot find module 'uuid'
```bash
npm install uuid
npm install -D @types/uuid
```

### 错误: react-dropzone 找不到
这个依赖应该已经在 package.json 中，如果报错：
```bash
npm install react-dropzone
```

### TypeScript 错误
```bash
npm install -D @types/node @types/react @types/react-dom
```

---

## 完整的依赖安装命令

复制以下完整命令到终端：

```bash
npm install @vercel/postgres @vercel/blob multer @nestjs/platform-express @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid react-dropzone && npm install -D @types/multer @types/uuid
```
