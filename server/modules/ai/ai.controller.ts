import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { TogetherAIService } from './together-ai.service';

interface GenerateTryonDto {
  personImageUrl: string;
  clothingImageUrl: string;
}

interface GenerateSuggestionDto {
  userDemand?: string;
  personImageUrl?: string;
  clothingImageUrl?: string;
}

@Controller('api/ai')
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(private readonly togetherAIService: TogetherAIService) {}

  /**
   * Generate virtual try-on image
   */
  @Post('tryon')
  async generateTryon(@Body() dto: GenerateTryonDto) {
    try {
      const imageUrl = await this.togetherAIService.generateVirtualTryon(
        dto.personImageUrl,
        dto.clothingImageUrl
      );

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      this.logger.error('Tryon generation failed', error);
      throw error;
    }
  }

  /**
   * Generate style suggestion (streaming)
   */
  @Post('suggestion')
  async generateSuggestion(@Body() dto: GenerateSuggestionDto) {
    // Note: For SSE streaming, you'd need to implement SSE support
    // For now, returning non-streaming version
    try {
      const content = await this.togetherAIService.generateStyleSuggestion(
        dto.personImageUrl,
        dto.clothingImageUrl,
      );

      return {
        success: true,
        content,
      };
    } catch (error) {
      this.logger.error('Suggestion generation failed', error);
      throw error;
    }
  }

  /**
   * Health check for AI service
   */
  @Get('health')
  async healthCheck() {
    const isHealthy = await this.togetherAIService.healthCheck();
    return {
      status: isHealthy ? 'ok' : 'error',
      service: 'Together AI',
    };
  }

  /**
   * Debug: 检查环境变量是否被正确加载
   */
  @Get('debug')
  async debug() {
    return {
      accessKey: process.env.VOLCENGINE_ACCESS_KEY
        ? `已配置 (长度:${process.env.VOLCENGINE_ACCESS_KEY.length})`
        : '未配置',
      secretKey: process.env.VOLCENGINE_SECRET_KEY
        ? `已配置 (长度:${process.env.VOLCENGINE_SECRET_KEY.length})`
        : '未配置',
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
    };
  }
}
