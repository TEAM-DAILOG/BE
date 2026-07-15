import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuestionEntity } from './entities/ai-question.entity';
import { AnswerEntity } from './entities/ai-answer.entity';
import { DiaryQuestionEntity } from './entities/ai-diary-question.entity';
import { AIQuestionDTO } from './dto/ai-question.dto';
import { AIanswercreateResponseDTO, AIAnswerDTO } from './dto/ai-answer.dto';
import { DiaryQuestionDTO } from './dto/ai-diary-question.dto';
import { GeminiService } from './gemini.service';
import { DiaryService } from '../diaries/diary.service';
import { NotFoundException } from '../global/error/custom.exception';

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,

    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,

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

  // TODO: 테스트 단계라 매번 덮어쓰기 중 — 정식 오픈 전엔 이미 답변이 있으면 그대로 반환하는 정책으로 변경 검토
  async createAnswer(diaryId: number): Promise<AIanswercreateResponseDTO> {
    const diary = await this.diaryService.findOneDiary(diaryId);
    const content = await this.geminiService.generateAnswer(diary.content);

    const existing = await this.answerRepository.findOne({
      where: { diary: { diaryId } },
    });

    const answer = await this.answerRepository.save(
      existing
        ? { ...existing, answer: content, diary }
        : this.answerRepository.create({ answer: content, diary }),
    );

    return new AIanswercreateResponseDTO(answer);
  }

  async getAnswer(diaryId: number): Promise<AIAnswerDTO> {
    await this.diaryService.findOneDiary(diaryId);

    const answer = await this.answerRepository.findOne({
      where: { diary: { diaryId } },
    });

    if (!answer) {
      throw new NotFoundException('아직 생성된 AI 답변이 없습니다.');
    }

    return new AIAnswerDTO(answer);
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
