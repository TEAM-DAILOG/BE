import { ApiProperty } from '@nestjs/swagger';
import { QuestionEntity } from '../entities/ai-question.entity';

export class AIQuestionDTO {
  @ApiProperty({ example: '질문의 id입니다' })
  questionId: number;

  @ApiProperty({ example: '질문의 내용입니다' })
  content: string;

  @ApiProperty({ example: '질문의 날짜입니다' })
  targetDate: string;

  constructor(question: QuestionEntity) {
    this.questionId = question.questionId;
    this.content = question.content;
    this.targetDate = question.targetDate;
  }
}
