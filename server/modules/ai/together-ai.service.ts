import { Injectable, Logger } from '@nestjs/common';
import { VolcengineTryonService } from './volcengine-tryon.service';
import { DoubaoVisionService } from './doubao-vision.service';

@Injectable()
export class TogetherAIService {
  private readonly logger = new Logger(TogetherAIService.name);

  constructor(
    private readonly volcengineService: VolcengineTryonService,
    private readonly visionService: DoubaoVisionService,
  ) {}

  async generateVirtualTryon(
    personImageUrl: string,
    clothingImageUrl: string,
    clothingType: 'upper' | 'bottom' | 'full' = 'full',
  ): Promise<string> {
    this.logger.log('AI: Generating virtual try-on');
    return this.volcengineService.generateVirtualTryon(
      personImageUrl,
      clothingImageUrl,
      clothingType,
    );
  }

  /**
   * 穿搭建议 - 调用豆包视觉模型分析图片
   */
  async generateStyleSuggestion(
    personImageUrl?: string,
    clothingImageUrl?: string,
  ): Promise<string> {
    if (personImageUrl && clothingImageUrl) {
      this.logger.log('AI: 使用豆包视觉模型生成穿搭建议');
      return this.visionService.analyzeOutfit(personImageUrl, clothingImageUrl);
    }

    this.logger.log('AI: 无图片，使用 Mock 建议');
    return this.visionService.analyzeOutfit('', '');
  }

  async healthCheck(): Promise<boolean> {
    return this.volcengineService.healthCheck();
  }
}
