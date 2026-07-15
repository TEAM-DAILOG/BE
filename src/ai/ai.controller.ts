import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiService } from './ai.service';
import {
  FindTodayQuestionSwagger,
  RegenerateTodayQuestionSwagger,
} from './ai.swagger';

@ApiTags('AI')
@Controller('ai/questions')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 오늘의 질문 조회
   */
  @FindTodayQuestionSwagger()
  @Get('today')
  async findTodayQuestion() {
    return this.aiService.getTodayQuestion();
  }

  /**
   * 오늘의 질문 재생성 (테스트용)
   */
  @RegenerateTodayQuestionSwagger()
  @Post('today/regenerate')
  async regenerateTodayQuestion() {
    return this.aiService.regenerateTodayQuestion();
  }
}
