import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { TogetherAIService } from './together-ai.service';

@Module({
  controllers: [AIController],
  providers: [TogetherAIService],
  exports: [TogetherAIService],
})
export class AIModule {}
