import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QuestionService } from './services/ai-question.service';
import { AnswerService } from './services/ai-answer.service';
import { RecommendService } from './services/ai-recommend.service';
import { LinkDiaryQuestionRequestDTO } from './dto/ai-diary-question.dto';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';
import {
  FindTodayQuestionSwagger,
  RegenerateTodayQuestionSwagger,
  LinkDiaryQuestionSwagger,
  FindDiaryQuestionSwagger,
  CreateAnswerSwagger,
  FindAnswerSwagger,
  CreateRecommendationsSwagger,
  AddRecommendationSwagger,
  FindRecommendationsSwagger,
} from './ai.swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly recommendService: RecommendService,
  ) {}

  /**
   * 오늘의 질문 조회
   */
  @FindTodayQuestionSwagger()
  @Get('questions/today')
  async findTodayQuestion() {
    const data = await this.questionService.getTodayQuestion();

    return { message: '오늘의 질문 조회 성공', data };
  }

  /**
   * 오늘의 질문 재생성 (테스트용)
   */
  @RegenerateTodayQuestionSwagger()
  @Post('questions/today/regenerate')
  async regenerateTodayQuestion() {
    const data = await this.questionService.regenerateTodayQuestion();

    return { message: '오늘의 질문 재생성 성공', data };
  }

  /**
   * 질문-일기 연결 (테스트용)
   */
  @LinkDiaryQuestionSwagger()
  @Post('questions/link')
  async linkDiaryQuestion(@Body() dto: LinkDiaryQuestionRequestDTO) {
    await this.questionService.linkDiaryQuestion(dto.questionId, dto.diaryId);

    return { message: '질문-일기 연결 성공' };
  }

  /**
   * 일기-질문 매핑 조회
   */
  @FindDiaryQuestionSwagger()
  @Get('questions/link/:diaryId')
  async findDiaryQuestion(@Param('diaryId', ParseIntPipe) diaryId: number) {
    const data = await this.questionService.getDiaryQuestion(diaryId);

    return { message: '일기-질문 매핑 조회 성공', data };
  }

  /**
   * AI 답변 생성
   */
  @CreateAnswerSwagger()
  @Post('answer/:diaryId')
  async createAnswer(@Param('diaryId', ParseIntPipe) diaryId: number) {
    const data = await this.answerService.createAnswer(diaryId);

    return { message: 'AI 답변 생성 성공', data };
  }

  /**
   * AI 답변 확인
   */
  @FindAnswerSwagger()
  @Get('answer/:diaryId')
  async findAnswer(@Param('diaryId', ParseIntPipe) diaryId: number) {
    const data = await this.answerService.getAnswer(diaryId);

    return { message: 'AI 답변 확인 성공', data };
  }

  /**
   * AI 일정 추천 최초 생성 (한 번에 3개)
   */
  @AccessTokenAuth()
  @CreateRecommendationsSwagger()
  @Post('schedules')
  async createRecommendations(@CurrentUserId() userId: number) {
    const data =
      await this.recommendService.createInitialRecommendations(userId);

    return { message: 'AI 일정 추천 생성 성공', data };
  }

  /**
   * AI 일정 추천 추가 생성 (1개)
   */
  @AccessTokenAuth()
  @AddRecommendationSwagger()
  @Post('schedules/add')
  async addRecommendation(@CurrentUserId() userId: number) {
    const data = await this.recommendService.addRecommendation(userId);

    return { message: 'AI 일정 추천 추가 생성 성공', data };
  }

  /**
   * AI 일정 추천 조회
   */
  @AccessTokenAuth()
  @FindRecommendationsSwagger()
  @Get('schedules')
  async findRecommendations(@CurrentUserId() userId: number) {
    const data = await this.recommendService.getTodayRecommendations(userId);

    return { message: 'AI 일정 추천 조회 성공', data };
  }
}
