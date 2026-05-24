# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1-2 为设计意图与决策上下文。Code agent 实现时以 Section 3 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: 爱打扮、想尝试新穿搭的普通用户，对穿搭感兴趣的年轻女性用户为主，使用场景是在手机或电脑上快速预览穿搭效果，带着期待和探索的心理使用产品
- **核心目的**: 引导用户上传图片、触发AI换装、展示生成结果并提供穿搭建议，满足用户试穿新衣的好奇心，帮助用户做出购买或搭配决策
- **期望情绪**: 兴奋、期待、愉悦、轻松，让用户感受到AI技术带来的便利和乐趣
- **需避免的感受**: 复杂难懂、操作繁琐、加载无聊、廉价感、结果不可信

### 1.2 设计语言

- **Aesthetic Direction**: 柔和明亮的现代女性向设计，主色选择温暖柔和的暖粉色系，营造时尚优雅的穿搭氛围，同时保持操作界面简洁易用
- **Visual Signature**:
  1. 柔和圆角卡片设计，每个上传区域都有清晰的边界和留白
  2. 主行动按钮使用大圆角胶囊形状，强化亲和力和可点击性
  3. 低饱和度暖粉主色搭配干净浅灰背景，不抢图片内容的风头
  4. 卡片网格展示历史记录，保持整齐有序的视觉节奏
- **Emotional Tone**: 时尚亲切 — 让用户在轻松愉悦的氛围中尝试不同穿搭
- **Design Style**: Rounded 圆润几何 — AI穿搭工具需要亲和力，大圆角+柔和阴影符合时尚产品的轻盈感
- **Application Type**: Tool 单页工具类应用 — 聚焦核心操作，内容线性流程

## 2. Design Principles (设计理念)

1. **图片优先**: 界面设计让位于图片展示，突出用户上传照片和生成效果，避免装饰元素干扰视觉焦点
2. **流程清晰**: 从上传 → 生成 → 结果 → 建议的操作流程一目了然，每一步都有明确反馈
3. **愉悦体验**: 柔和色彩和圆角设计缓解用户等待生成的焦虑，营造轻松探索的氛围
4. **信任可靠**: 清晰的错误提示和加载状态，让用户明白当前处理进度，减少不确定性

## 3. Color System (色彩系统)

> 基于内容理解推导配色方案，确保整体协调。

**配色设计理由**：穿搭工具面向女性用户为主，选择低饱和度暖粉色作为主色，既符合时尚穿搭的调性，又不会过于艳俗，保持界面干净高级的质感；背景使用极浅暖灰色，让图片内容更加突出。

### 3.1 主题颜色

> **Color Token 语义速查（供 code agent 参考）**:
> - `primary` → 主行动：按钮填充、激活态高亮、关键操作 CTA
> - `accent` → 状态反馈：Ghost/Outline 按钮 hover、DropdownMenu focus、Toggle 激活、Skeleton 占位背景
> - `muted` → 静态非交互：禁用态背景、次级说明背景、占位文字色（`text-muted-foreground`）
> - **选择原则**：用户"可以点击" → primary；交互"正在发生" → accent；内容"不可操作" → muted

| 角色               | CSS 变量               | Tailwind Class            | HSL 值    
| ------------------ | ---------------------- | ------------------------- | ---------- 
| bg                 | `--background`         | `bg-background`           | hsl(350 20% 97%)
| card               | `--card`               | `bg-card`                 | hsl(0 0% 100%)
| text               | `--foreground`         | `text-foreground`         | hsl(345 15% 15%)
| textMuted          | `--muted-foreground`   | `text-muted-foreground`   | hsl(345 8% 45%)
| primary            | `--primary`            | `bg-primary`              | hsl(350 70% 55%)
| primary-foreground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%)
| accent             | `--accent`             | `bg-accent`               | hsl(350 25% 95%)
| accent-foreground  | `--accent-foreground`  | `text-accent-foreground`  | hsl(350 70% 55%)
| border             | `--border`             | `border-border`           | hsl(350 15% 90%)

### 3.3 Topbar/Header 设计策略（仅当使用顶部导航时定义）

> **定义时机**：仅当 Navigation Type 为 Topbar / Fixed Top / Sticky Top 时，必须定义此章节
> **设计原则**：顶部导航使用主配色系统，不需要独立的 CSS 变量。说明如何应用现有颜色角色。

**背景策略**：使用 `bg-card` + 底部边框，与内容区保持一致视觉层次，简单清晰

**文字与图标**：
- 默认态：使用 `text-muted-foreground`
- 激活态：使用 `text-primary` 加粗标识当前页面
- Hover 态：使用 `bg-accent` 作为背景高亮，文字保持 `text-primary`

**边框与分隔**：底部使用 `border-border` 细线分隔，区分导航与内容区域

### 3.4 语义颜色（可选）

| 用途        | CSS 变量          | HSL 值                  | 文字颜色               |
| ----------- | ----------------- | ----------------------- | ---------------------- |
| 成功/完成   | `--success`       | hsl(145 65% 45%)       | `text-white`           |
| 错误/失败   | `--destructive`   | hsl(0 70% 50%)         | `text-white`           |
| 警告/提示   | `--warning`       | hsl(38 90% 50%)        | `text-foreground`      |

## 4. Typography (字体排版)

- **Heading**: 思源黑体，系统字体回退：`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Body**: 思源黑体，系统字体回退：`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **字体导入**: 使用系统字体栈，无需引入外部字体

## 5. Layout Strategy (布局策略)

### 5.1 结构方向

**导航策略**：顶部导航栏 → 应用包含两个页面（换装首页、历史记录页），使用顶部导航可以清晰切换页面，保持导航简洁不占侧边空间，让图片展示区域更大

**页面架构特征**：工具类应用，聚焦核心功能区域，换装首页保持单栏流程布局，历史记录页使用卡片网格展示，兼顾内容密度和可读性

### 5.2 响应式原则

**断点策略**：
- 移动端：顶部导航折叠为汉堡菜单，内容全宽展示
- 平板及桌面：顶部导航完整展示所有菜单项
- 内容区最大宽度限制为 `max-w-5xl`，保持图片不会过度拉伸，居中显示

**内容密度**：
- 移动端：单列布局，上传卡片上下堆叠，结果对比改为上下排列
- 桌面端：双栏并排展示上传区域，结果对比左右分栏
- 所有可点击按钮最小尺寸 ≥ 48px，满足触摸设备点击要求

## 6. Visual Language (视觉语言)

**形态特征**：圆润亲切 — 所有卡片和按钮使用大圆角设计，柔和的小阴影营造浮起层次感，胶囊形状的主按钮强化可交互性

- 圆角：`rounded-xl` (0.75rem) 用于卡片，按钮使用 `rounded-full` 胶囊造型
- 阴影：`shadow-sm` 用于卡片阴影，hover 时轻微升为 `shadow-md`，保持柔和不突兀

**装饰策略**：极简设计，仅在首页顶部可以使用淡淡的渐变圆点装饰，不干扰内容展示，整体通过留白和排版建立视觉层次

**动效原则**：
- 交互反馈快速响应，hover/active 状态过渡时长 150ms
- 加载状态使用流畅的脉冲动画，缓解用户等待焦虑
- 图片展示和结果呈现使用淡入动画，营造流畅体验

**可及性保障**：
- 文字与背景对比度 ≥ 4.5:1（大字号 ≥ 3:1），所有文字都满足 WCAG AA 标准
- 上传卡片、按钮都有明确的 hover/focus 状态反馈
- 错误提示使用语义红色，清晰醒目
- 图片都带有 alt 描述，支持屏幕阅读器
