/**
 * AI 换装插件
 * 部署到 Vercel 后，这里会调用后端 API
 * 本地开发时使用 Mock 数据
 */

import { toast } from 'sonner';

const API_BASE = '/api';

export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/tryon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personImageUrl,
        clothingImageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('AI 换装失败');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    toast.error('AI 换装失败，请重试');
    throw error;
  }
}

export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/suggestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userDemand,
      }),
    });

    if (!response.ok) {
      throw new Error('生成建议失败');
    }

    const data = await response.json();
    const text = data.content || '';

    // 模拟流式输出效果
    for (let i = 0; i < text.length; i++) {
      onChunk(text.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return text;
  } catch (error) {
    toast.error('生成穿搭建议失败');
    throw error;
  }
}
