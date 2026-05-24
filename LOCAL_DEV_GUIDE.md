# 本地开发指南

## 快速启动

由于项目使用飞书平台的原生功能，本地开发需要配置相应的环境。

### 方案一：使用飞书平台开发（推荐用于测试）

1. **在飞书开放平台创建应用**
   - 访问 https://open.feishu.cn
   - 创建应用，获取 App ID 和 App Secret

2. **配置环境变量**
   ```env
   # 在飞书平台运行时，这些会自动配置
   # 本地开发时，使用飞书的本地调试功能
   ```

3. **启动项目**
   - 使用飞书 CLI 工具进行本地调试
   - 或直接部署到飞书平台进行测试

### 方案二：本地化改造（推荐用于 Vercel 部署）

如果你想完全脱离飞书平台在本地运行，需要进行以下改造：

## 本地化改造步骤

### 1. 安装本地数据库

选择其一：

**选项 A: Docker + PostgreSQL**
```bash
docker run -d \
  --name ai-outfit-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_outfit \
  -p 5432:5432 \
  postgres:15
```

**选项 B: 使用 SQLite（最简单）**
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### 2. 配置环境变量

创建 `.env.local` 文件：
```env
# 使用 SQLite
DATABASE_URL=file:./ai-outfit.db

# 或使用 PostgreSQL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_outfit

# AI 服务（临时使用占位符）
AI_SERVICE=mock

# 服务器配置
SERVER_PORT=3000
LOG_REQUEST_BODY=true
LOG_RESPONSE_BODY=true
```

### 3. 创建简化的本地版本

为了快速测试，我建议创建一个最小可运行版本：

**使用 Mock 数据测试界面**

修改 `client/src/utils/outfit-plugins.ts`：

```typescript
// Mock 版本用于本地测试界面
export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  // 模拟 AI 处理延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 直接返回目标图片作为示例结果
  console.log('Mock AI generation:', { personImageUrl, clothingImageUrl });
  return clothingImageUrl;
}

export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  // 模拟 AI 生成文本
  const mockText = `根据您的需求"${userDemand}"，这里是一些穿搭建议：

**风格定位**
适合简约时尚风格，突出个人品味。

**搭配技巧**
建议选择中性色调，搭配简约配饰。

**适配场景**
适合日常通勤、休闲聚会等多种场合。`;

  // 模拟流式输出
  for (let i = 0; i < mockText.length; i++) {
    onChunk(mockText.slice(0, i + 1));
    await new Promise(resolve => setTimeout(resolve, 20));
  }

  return mockText;
}
```

修改 `client/src/pages/HomePage/HomePage.tsx` 中的上传部分：

```typescript
// 使用本地临时文件上传
const onDrop = useCallback(
  async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 创建本地预览 URL
    const localUrl = URL.createObjectURL(file);
    onUpload(localUrl);
    toast.success(`${label}上传成功（本地预览）`);
  },
  [label, onUpload]
);
```

### 4. 启动开发服务器

**终端 1 - 启动后端：**
```bash
npm run dev:server
```

**终端 2 - 启动前端：**
```bash
npm run dev:client
```

### 5. 访问应用

打开浏览器访问：`http://localhost:5173`

## 当前状态说明

✅ **已安装的依赖**
- 所有 Vercel 相关依赖已安装
- NestJS、React 等核心依赖正常

⚠️ **当前问题**
- 项目使用飞书平台的数据库和存储服务
- AI 换装使用豆包插件
- 这些功能在纯本地环境无法直接运行

## 推荐的开发流程

### 方案 A: 使用飞书平台开发（最快）
1. 在飞书开放平台创建应用
2. 使用飞书 CLI 进行本地调试
3. 界面和功能开发完成后，再考虑迁移

### 方案 B: Mock 数据开发界面
1. 使用 Mock 数据替换 AI 和存储调用
2. 先完成界面和交互开发
3. 界面确认无误后，再接入真实服务

### 方案 C: 完整本地化改造
1. 按照上面步骤配置本地数据库
2. 修改代码移除飞书依赖
3. 使用真实的 AI 服务（Together AI、OpenAI 等）
4. 完成后部署到 Vercel

## 快速测试界面（推荐）

现在最快的方式是使用 Mock 数据测试界面：

1. 我已经帮你创建了 Mock 版本的文件
2. 可以立即看到界面效果
3. 确认界面无误后再接入真实服务

需要我帮你创建 Mock 版本吗？
