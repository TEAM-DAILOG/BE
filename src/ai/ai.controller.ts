import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiService } from './ai.service';
import { LinkDiaryQuestionRequestDTO } from './dto/ai-diary-question.dto';
import {
  FindTodayQuestionSwagger,
  RegenerateTodayQuestionSwagger,
  LinkDiaryQuestionSwagger,
  FindDiaryQuestionSwagger,
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
    const data = await this.aiService.getTodayQuestion();

    return { message: '오늘의 질문 조회 성공', data };
  }

  /**
   * 오늘의 질문 재생성 (테스트용)
   */
  @RegenerateTodayQuestionSwagger()
  @Post('today/regenerate')
  async regenerateTodayQuestion() {
    const data = await this.aiService.regenerateTodayQuestion();

    return { message: '오늘의 질문 재생성 성공', data };
  }

  /**
   * 질문-일기 연결 (테스트용)
   */
  @LinkDiaryQuestionSwagger()
  @Post('link')
  async linkDiaryQuestion(@Body() dto: LinkDiaryQuestionRequestDTO) {
    const data = await this.aiService.linkDiaryQuestion(
      dto.questionId,
      dto.diaryId,
    );

    return { message: '질문-일기 연결 성공', data };
  }

  /**
   * 일기-질문 매핑 조회
   */
  @FindDiaryQuestionSwagger()
  @Get('link/:diaryId')
  async findDiaryQuestion(@Param('diaryId', ParseIntPipe) diaryId: number) {
    const data = await this.aiService.getDiaryQuestion(diaryId);

    return { message: '일기-질문 매핑 조회 성공', data };
  }
}
