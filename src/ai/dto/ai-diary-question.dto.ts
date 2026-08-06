import { DiaryQuestionEntity } from '../entities/ai-diary-question.entity';

export class DiaryQuestionDTO {
  diaryQuestionId: number;

  questionId: number;

  questionContent: string;

  diaryId: number;

  isWritten: boolean;

  constructor(entity: DiaryQuestionEntity) {
    this.diaryQuestionId = entity.diaryQuestionId;
    this.questionId = entity.question.questionId;
    this.questionContent = entity.question.content;
    this.diaryId = entity.diary.diaryId;
    this.isWritten = entity.isWritten;
  }
}
