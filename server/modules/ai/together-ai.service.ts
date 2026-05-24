import { Injectable, Logger } from '@nestjs/common';

/**
 * Mock AI Service - 用于本地开发
 * 部署到 Vercel 后替换为真实的 Together AI 服务
 */
@Injectable()
export class TogetherAIService {
  private readonly logger = new Logger(TogetherAIService.name);

  /**
   * Mock virtual try-on - 返回目标图片作为示例
   */
  async generateVirtualTryon(
    personImageUrl: string,
    clothingImageUrl: string
  ): Promise<string> {
    this.logger.log('Mock AI: Generating virtual try-on');

    // 模拟 AI 处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 直接返回目标图片作为示例
    return clothingImageUrl;
  }

  /**
   * Mock style suggestion - 返回示例文本
   */
  async generateStyleSuggestion(
    userDemand: string,
    onChunk?: (text: string) => void
  ): Promise<string> {
    this.logger.log('Mock AI: Generating style suggestion');

    const mockText = `根据您的需求"${userDemand}"，为您提供以下穿搭建议：

## 风格定位
这套搭配采用现代简约风格，线条流畅，色彩和谐，展现优雅气质。

## 搭配技巧
- 选择与肤色协调的色系，突出个人特色
- 服装剪裁合身，展现优美身形
- 适当运用配饰点缀，提升整体品味

## 适配场景
- 日常办公：专业又不失个性
- 休闲聚会：轻松自然
- 商务场合：得体大方

希望这些建议对您有帮助！`;

    if (onChunk) {
      // 模拟流式输出
      for (let i = 0; i < mockText.length; i++) {
        onChunk(mockText.slice(0, i + 1));
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return mockText;
  }

  /**
   * Mock health check
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }
}
