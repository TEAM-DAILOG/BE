import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';

import { QuestionEntity } from '../entities/ai-question.entity';
import { DiaryQuestionEntity } from '../entities/ai-diary-question.entity';
import { AIQuestionDTO } from '../dto/ai-question.dto';
import { DiaryQuestionDTO } from '../dto/ai-diary-question.dto';
import { GeminiService } from './ai-gemini.service';
import { DiaryService } from '../../diaries/diary.service';
import {
  InternalServerException,
  NotFoundException,
} from '../../global/error/custom.exception';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === POSTGRES_UNIQUE_VIOLATION
  );
}

@Injectable()
export class QuestionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(QuestionService.name);

  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    @InjectRepository(DiaryQuestionEntity)
    private readonly diaryQuestionRepository: Repository<DiaryQuestionEntity>,

    private readonly geminiService: GeminiService,
    private readonly diaryService: DiaryService,
  ) {}

  // 서버가 자정 cron을 놓치고 부팅된 경우의 캐치업 — 오늘 질문이 없으면 즉시 생성
  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.getTodayQuestion();
    } catch (error) {
      this.logger.warn(
        `부팅 시 오늘의 질문 생성 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // 매일 자정에 오늘의 질문을 미리 생성해둔다 (getTodayQuestion과 동일한 멱등 로직 재사용)
  @Cron('0 0 * * *')
  async handleMidnightQuestionGeneration(): Promise<void> {
    try {
      await this.getTodayQuestion();
    } catch (error) {
      this.logger.warn(
        `자정 오늘의 질문 생성 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTodayQuestion(): Promise<AIQuestionDTO> {
    const targetDate = todayDateString();

    const existing = await this.questionRepository.findOne({
      where: { targetDate },
    });

    if (existing) {
      return new AIQuestionDTO(existing);
    }

    const content = await this.geminiService.generateTodayQuestion();

    try {
      const question = await this.questionRepository.save(
        this.questionRepository.create({ content, targetDate }),
      );

      return new AIQuestionDTO(question);
    } catch (error) {
      // cron/부팅 캐치업/유저 요청이 동시에 겹쳐도 target_date unique 제약으로
      // 하나만 저장되고 나머지는 여기로 떨어짐 — 이미 만들어진 걸 그대로 반환
      if (!isUniqueViolation(error)) {
        throw new InternalServerException();
      }

      const created = await this.questionRepository.findOneBy({
        targetDate,
      });

      if (!created) {
        throw new InternalServerException();
      }

      return new AIQuestionDTO(created);
    }
  }

  // 테스트용: 오늘의 질문을 강제로 재생성한다
  async regenerateTodayQuestion(): Promise<AIQuestionDTO> {
    const targetDate = todayDateString();
    const content = await this.geminiService.generateTodayQuestion();

    const existing = await this.questionRepository.findOne({
      where: { targetDate },
    });

    const question = await this.questionRepository.save(
      existing
        ? { ...existing, content }
        : this.questionRepository.create({ content, targetDate }),
    );

    return new AIQuestionDTO(question);
  }

  // TODO: 지금은 테스트 엔드포인트에서만 호출됨 — diary.service.ts의 createDiary()에서
  // 질문일기(questionId 있는 경우) 생성 시 이 메소드를 호출해서 실제 연결이 이뤄지도록 해야 함
  async linkDiaryQuestion(questionId: number, diaryId: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { questionId },
    });

    if (!question) {
      throw new NotFoundException('존재하지 않는 질문입니다.');
    }

    const diary = await this.diaryService.findOneDiary(diaryId);

    const existing = await this.diaryQuestionRepository.findOne({
      where: { diary: { diaryId } },
    });

    await this.diaryQuestionRepository.save(
      existing
        ? { ...existing, question, diary, isWritten: true }
        : this.diaryQuestionRepository.create({
            question,
            diary,
            isWritten: true,
          }),
    );
  }

  async getDiaryQuestion(diaryId: number): Promise<DiaryQuestionDTO> {
    await this.diaryService.findOneDiary(diaryId);

    const diaryQuestion = await this.diaryQuestionRepository.findOne({
      where: { diary: { diaryId } },
      relations: ['question', 'diary'],
    });

    if (!diaryQuestion) {
      throw new NotFoundException('연결된 질문이 없습니다.');
    }

    return new DiaryQuestionDTO(diaryQuestion);
  }
}
