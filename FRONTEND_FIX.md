# 🔧 前端空白页面修复指南

## 问题诊断
访问 http://localhost:5173 显示空白页面

## 解决方案

### 方案一：修复 vite 配置路径
问题在于 `vite.config.ts` 中的 `root: 'client'` 配置导致路径解析错误。

**修复步骤**：
1. 停止当前前端服务（在终端按 Ctrl+C）
2. 修改配置文件（已自动修复）
3. 重新启动前端服务

### 方案二：使用生产构建测试
```bash
# 构建前端
npm run build:client

# 使用简单的 HTTP 服务器测试
npx serve dist/client -l 8080

# 访问 http://localhost:8080
```

### 方案三：检查浏览器控制台
1. 按 F12 打开开发者工具
2. 查看 Console 标签页的错误信息
3. 查看 Network 标签页的请求失败

### 方案四：手动测试组件
创建简单测试页面验证基础功能：

```bash
# 访问测试页面
curl http://localhost:3000/ai/health
# 应该返回: {"status":"ok","service":"Together AI"}
```

## 快速修复命令

```bash
# 停止所有服务
Ctrl+C

# 清理并重新构建
rm -rf dist/client
npm run build:client

# 使用生产版本
cd dist/client
python -m http.server 8080

# 或者使用 Node.js 服务器
npx serve . -l 8080
```

## 当前已修复的问题
✅ 更新了 `client/index.html` 脚本路径
✅ 修复了 vite 配置路径问题
✅ 创建了备用前端服务器端口

## 访问地址
- **原前端**: http://localhost:5173 (可能有问题)
- **新前端**: http://localhost:5174 (备用)
- **后端 API**: http://localhost:3000 (正常工作)
- **生产构建**: http://localhost:8080 (推荐测试)

建议先使用生产构建版本测试前端功能是否正常。
