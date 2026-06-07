# 🚀 本地服务访问指南

## ✅ 服务已启动成功！

### 🎯 访问地址

**前端界面**: **http://localhost:5173**  
**后端 API**: **http://localhost:3000**

---

## 🌐 如何访问应用

### 方法一：直接访问（推荐）

1. **打开浏览器**
2. **访问**: http://localhost:5173
3. **开始测试功能**

### 方法二：命令行测试 API

```bash
# 健康检查
curl http://localhost:3000/ai/health
# 返回: {"status":"ok","service":"Together AI"}

# AI 换装测试
curl -X POST http://localhost:3000/ai/tryon \
  -H "Content-Type: application/json" \
  -d '{"personImageUrl":"https://example.com/person.jpg","clothingImageUrl":"https://example.com/cloth.jpg"}'
# 返回: {"success":true,"imageUrl":"https://example.com/cloth.jpg"}

# 历史记录查询
curl http://localhost:3000/history
# 返回: {"items":[],"total":0}
```

---

## 🎨 功能测试清单

### 1. 图片上传功能 ✅
- 访问 http://localhost:5173
- 点击"个人自拍照"区域
- 选择一张图片上传
- 查看上传效果

### 2. AI 换装功能 ✅
- 上传两张图片（人物照片 + 穿搭照片）
- 点击"一键换装"按钮
- 查看 Mock 换装结果（返回目标图片）

### 3. 穿搭建议功能 ✅
- 换装完成后自动显示
- 查看 Mock 建议文本（固定内容）

### 4. 历史记录功能 ✅
- 点击顶部导航的"历史记录"
- 查看之前的换装记录
- 测试删除功能

---

## 📊 当前服务状态

### 后端服务 (端口 3000)
```
✓ 状态: 运行中
✓ 地址: http://localhost:3000
✓ API 端点: /ai/health, /ai/tryon, /history
✓ 数据库: 本地 PostgreSQL (如配置)
✓ 文件存储: 本地文件系统 (uploads/ 目录)
```

### 前端服务 (端口 5173)
```
✓ 状态: 运行中
✓ 地址: http://localhost:5173
✓ 类型: Vite 开发服务器
✓ 热更新: 支持
✓ 代理: /api → http://localhost:3000
```

---

## 🔧 服务管理命令

### 启动服务

**方式一：分别启动**
```bash
# 终端 1: 启动后端
npm run dev:server

# 终端 2: 启动前端
npm run dev:client
```

**方式二：同时启动（推荐）**
```bash
npm run dev
```

### 停止服务

```bash
# 停止后台进程
pkill -f "nest start"
pkill -f "vite"

# 或者在终端中按 Ctrl+C
```

---

## 🎯 测试场景

### 场景一：完整换装流程
1. 访问 http://localhost:5173
2. 上传人物照片
3. 上传穿搭照片
4. 点击"一键换装"
5. 查看 Mock 结果

### 场景二：API 测试
```bash
# 测试所有 API 端点
curl http://localhost:3000/ai/health
curl -X POST http://localhost:3000/ai/tryon -H "Content-Type: application/json" -d '{"personImageUrl":"test","clothingImageUrl":"test"}'
curl http://localhost:3000/history
```

### 场景三：错误处理
- 上传非图片文件（应该被拒绝）
- 上传超大文件（应该被拒绝）
- 只上传一张图片（应该提示错误）

---

## 📱 浏览器开发者工具

### 查看网络请求
1. 按 F12 打开开发者工具
2. 切换到 "Network" 标签
3. 执行操作（上传图片、换装等）
4. 查看 API 请求和响应

### 查看控制台日志
1. 按 F12 打开开发者工具
2. 切换到 "Console" 标签
3. 查看应用日志和错误信息

---

## 🐛 常见问题

### 问题 1: 前端无法连接后端
**解决**: 确保两个服务都在运行
```bash
# 检查端口占用
curl http://localhost:3000/ai/health
curl http://localhost:5173
```

### 问题 2: 图片上传失败
**解决**: 检查 uploads/ 目录权限
```bash
# 确保 uploads 目录存在
mkdir -p uploads
chmod 755 uploads
```

### 问题 3: API 返回 500 错误
**解决**: 查看后端日志
```bash
# 后端终端会显示详细错误信息
```

---

## 🚀 下一步

### 本地测试完成后

1. **验证功能正常**
2. **提交代码到 Git**
3. **部署到 Vercel**
4. **配置 Vercel Blob 和 Postgres**

---

**现在你可以访问 http://localhost:5173 开始测试应用了！** 🎉
