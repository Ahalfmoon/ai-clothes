import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { TogetherAIService } from './together-ai.service';
import { VolcengineTryonService } from './volcengine-tryon.service';
import { DoubaoVisionService } from './doubao-vision.service';

@Module({
  controllers: [AIController],
  providers: [TogetherAIService, VolcengineTryonService, DoubaoVisionService],
  exports: [TogetherAIService, VolcengineTryonService, DoubaoVisionService],
})
export class AIModule {}
