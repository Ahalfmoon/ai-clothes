import { useNavigate } from "react-router-dom";
import { Sparkles, Upload, Shirt, Download, Check, ArrowRight, Star, Users, Zap, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ============================================================
   Landing Page — AI 换装产品介绍
   结构: Hero → Features → HowItWorks → Stats → Testimonial → CTA → Footer
   ============================================================ */

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ==================== 1. Hero ==================== */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 公告条 */}
          <div className="mb-8">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm">
              <Sparkles className="size-3.5 mr-1.5" />
              全新 AI 换装功能已上线
            </Badge>
          </div>

          {/* 主标题 — 渐变色关键词 */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            上传照片，
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI 一键换装
            </span>
          </h1>

          {/* 副标题 */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            无需试穿、无需 PS —— 上传你的自拍照和目标穿搭照，
            AI 自动生成逼真的虚拟换装效果，几秒看遍百种搭配。
          </p>

          {/* CTA 按钮组 */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base"
              onClick={() => navigate("/tryon")}
            >
              <Sparkles className="size-4 mr-2" />
              立即体验
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              了解更多
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>

          {/* 信任信号 */}
          <p className="mt-6 text-sm text-muted-foreground">
            <Users className="size-3.5 inline mr-1" />
            已有 10,000+ 用户生成 50,000+ 次换装效果
          </p>
        </div>
      </section>

      <Separator />

      {/* ==================== 2. Features 卡片网格 ==================== */}
      <section id="features" className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 区块标题 */}
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">核心功能</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              为什么选择 AI 换装
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              用 AI 技术彻底改变你的穿搭决策方式
            </p>
          </div>

          {/* 功能卡片 — 3 列网格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "极速上传",
                desc: "支持 JPG/PNG/WebP，拖拽即可上传，10MB 以内任意尺寸",
              },
              {
                icon: Sparkles,
                title: "AI 智能换装",
                desc: "深度学习模型精准识别服装轮廓，生成自然逼真的换装效果",
              },
              {
                icon: Zap,
                title: "秒级生成",
                desc: "仅需 2-5 秒即可完成一次换装，批量切换不同搭配",
              },
              {
                icon: Image,
                title: "高清输出",
                desc: "支持多种分辨率输出，保留原始照片画质细节",
              },
              {
                icon: Download,
                title: "一键下载",
                desc: "生成结果一键保存到本地，分享到社交平台",
              },
              {
                icon: Shirt,
                title: "穿搭建议",
                desc: "AI 分析你的身形和风格，给出个性化的穿搭推荐",
              },
            ].map((f, i) => (
              <Card
                key={i}
                className="p-6 border-muted hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 3. How It Works — 步骤流程 ==================== */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">三步搞定</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              简单三步，即刻换装
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              无需任何技术背景，像拍照一样简单
            </p>
          </div>

          {/* 步骤时间线 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "上传照片",
                desc: "拍摄或上传你的自拍照，再上传想要试穿的穿搭照",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "AI 生成",
                desc: "AI 分析两张照片，智能融合生成虚拟换装效果",
              },
              {
                step: "03",
                icon: Download,
                title: "保存分享",
                desc: "查看换装效果，一键下载高清图片或分享给朋友",
              },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                {/* 连接线 (非最后一列，桌面端) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}

                <div className="flex flex-col items-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold mb-4 shadow-lg shadow-primary/20">
                    <s.icon className="size-7" />
                  </div>
                  <p className="text-xs font-bold text-primary tracking-wider mb-2">STEP {s.step}</p>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4. Stats 数据区 ==================== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "注册用户" },
              { value: "50K+", label: "换装次数" },
              { value: "99.7%", label: "生成成功率" },
              { value: "<3s", label: "平均生成速度" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ==================== 5. Testimonial — 用户评价 ==================== */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">用户反馈</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              他们都在用
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "小王", role: "时尚博主", text: "再也不用频繁试穿了！上传衣服照片就能看到效果，省了好多时间。" },
              { name: "Lisa", role: "穿搭爱好者", text: "换季时不知道买什么，用这个试穿各种风格，决策快多了。" },
              { name: "阿杰", role: "电商运营", text: "商品图直接生成模特试穿效果，转化率提升了30%。" },
            ].map((t, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. CTA — 底栏行动号召 ==================== */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="rounded-2xl p-10 md:p-14 text-center border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              准备好体验 AI 换装了吗？
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              上传你的照片，几秒钟就能看到各种穿搭效果。完全免费，即刻开始。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-10 h-12 text-base"
                onClick={() => navigate("/tryon")}
              >
                <Sparkles className="size-4 mr-2" />
                免费开始体验
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              无需注册 · 无需下载 · 完全免费
            </p>
          </Card>
        </div>
      </section>

      {/* ==================== 7. Footer ==================== */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2026 AI Clothes. Powered by Vercel + NestJS.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
