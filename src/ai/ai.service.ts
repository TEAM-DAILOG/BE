import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuestionEntity } from './entities/ai-question.entity';
import { AIQuestionDTO } from './dto/ai-question.dto';
import { GeminiService } from './gemini.service';

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

    private readonly geminiService: GeminiService,
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
}
