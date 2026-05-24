/**
 * Mock 版本 - 用于本地开发和测试界面
 * 使用模拟数据，不需要真实的 AI 服务
 */

import { logger } from '@lark-apaas/client-toolkit/logger';

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  logger.info('Mock AI generation', { personImageUrl, clothingImageUrl });

  // 模拟 AI 处理延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 直接返回目标图片作为示例结果
  // 实际部署时替换为真实 AI 服务
  return clothingImageUrl;
}

export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  logger.info('Mock style suggestion', { userDemand });

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

  // 模拟流式输出效果
  const chars = mockText.split('');
  let current = '';

  for (const char of chars) {
    current += char;
    onChunk(current);
    await new Promise(resolve => setTimeout(resolve, 15));
  }

  return mockText;
}
