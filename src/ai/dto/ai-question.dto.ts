import { ApiProperty } from '@nestjs/swagger';
import { QuestionEntity } from '../entities/ai-question.entity';
import { toIsoDateTime } from '../../global/date.util';

export class AIQuestionDTO {
  @ApiProperty({ example: '질문의 id입니다' })
  questionId: number;

  @ApiProperty({ example: '질문의 내용입니다' })
  content: string;

  @ApiProperty({
    description: '질문의 날짜입니다',
    example: '2026-07-19T00:00:00Z',
  })
  targetDate: string;

  constructor(question: QuestionEntity) {
    this.questionId = question.questionId;
    this.content = question.content;
    this.targetDate = toIsoDateTime(question.targetDate);
  }
}
