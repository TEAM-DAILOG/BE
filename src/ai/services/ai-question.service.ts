import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuestionEntity } from '../entities/ai-question.entity';
import { DiaryQuestionEntity } from '../entities/ai-diary-question.entity';
import { AIQuestionDTO } from '../dto/ai-question.dto';
import { DiaryQuestionDTO } from '../dto/ai-diary-question.dto';
import { GeminiService } from './ai-gemini.service';
import { DiaryService } from '../../diaries/diary.service';
import { NotFoundException } from '../../global/error/custom.exception';

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    @InjectRepository(DiaryQuestionEntity)
    private readonly diaryQuestionRepository: Repository<DiaryQuestionEntity>,

    private readonly geminiService: GeminiService,
    private readonly diaryService: DiaryService,
  ) {}

  async getTodayQuestion(): Promise<AIQuestionDTO> {
    const targetDate = todayDateString();

    const existing = await this.questionRepository.findOne({
      where: { targetDate },
    });

    if (existing) {
      return new AIQuestionDTO(existing);
    }

    const content = await this.geminiService.generateTodayQuestion();
    const question = await this.questionRepository.save(
      this.questionRepository.create({ content, targetDate }),
    );

    return new AIQuestionDTO(question);
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

  // TODO: cron(@nestjs/schedule)으로 매일 자정 오늘의 질문을 미리 생성해두는 배치로 전환

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
