import { toast } from 'sonner';

// API base URL - will be proxied by Vercel
const API_BASE = '/api';

// AI Service interfaces
interface TryonResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

interface SuggestionResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Generate virtual try-on image using Vercel API
 * Calls the /api/ai/tryon endpoint
 */
export async function generateOutfitImage(
  personImageUrl: string,
  clothingImageUrl: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/tryon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personImageUrl,
        clothingImageUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI 换装失败');
    }

    const data: TryonResponse = await response.json();

    if (!data.success || !data.imageUrl) {
      throw new Error(data.error || 'AI 换装失败');
    }

    return data.imageUrl;
  } catch (error) {
    toast.error('AI 换装失败，请重试');
    throw error;
  }
}

/**
 * Stream style suggestion using Vercel API
 * Calls the /api/ai/suggestion endpoint
 * Note: Currently non-streaming, can be upgraded to SSE
 */
export async function streamStyleSuggestion(
  userDemand: string,
  onChunk: (text: string) => void
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userDemand,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '生成建议失败');
    }

    const data: SuggestionResponse = await response.json();

    if (!data.success || !data.content) {
      throw new Error(data.error || '生成建议失败');
    }

    // Simulate streaming by showing full text
    onChunk(data.content);

    return data.content;
  } catch (error) {
    toast.error('生成穿搭建议失败');
    throw error;
  }
}

/**
 * Health check for AI service
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ai/health`);
    if (!response.ok) return false;

    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
