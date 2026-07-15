import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiService } from './ai.service';
import { CreateAnswerSwagger, FindAnswerSwagger } from './ai.swagger';

@ApiTags('AI')
@Controller('ai/answer')
export class AiAnswerController {
  constructor(private readonly aiService: AiService) {}

  /**
   * AI 답변 생성
   */
  @CreateAnswerSwagger()
  @Post(':diaryId')
  async createAnswer(
    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    const data = await this.aiService.createAnswer(diaryId);

    return { message: 'AI 답변 생성 성공', data };
  }

  /**
   * AI 답변 확인
   */
  @FindAnswerSwagger()
  @Get(':diaryId')
  async findAnswer(
    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    const data = await this.aiService.getAnswer(diaryId);

    return { message: 'AI 답변 확인 성공', data };
  }
}
