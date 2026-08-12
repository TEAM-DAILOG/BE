import { QuestionEntity } from '../entities/ai-question.entity';
import { toIsoDateTime } from '../../global/date.util';

export class AIQuestionDTO {
  questionId: number;
  content: string;
  targetDate: string;
  constructor(question: QuestionEntity) {
    this.questionId = question.questionId;
    this.content = question.content;
    this.targetDate = toIsoDateTime(question.targetDate);
  }
}
