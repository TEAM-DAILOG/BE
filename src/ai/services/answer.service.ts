import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnswerEntity } from '../entities/ai-answer.entity';
import { AIanswercreateResponseDTO, AIAnswerDTO } from '../dto/ai-answer.dto';
import { GeminiService } from './gemini.service';
import { DiaryService } from '../../diaries/diary.service';
import { NotFoundException } from '../../global/error/custom.exception';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,

    private readonly geminiService: GeminiService,
    private readonly diaryService: DiaryService,
  ) {}

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
}
