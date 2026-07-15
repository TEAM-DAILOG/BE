import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { DiaryQuestionEntity } from '../entities/ai-diary-question.entity';

export class LinkDiaryQuestionRequestDTO {
  @ApiProperty({ example: 1, description: '질문 ID' })
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @ApiProperty({ example: 1, description: '일기 ID' })
  @IsInt()
  @IsNotEmpty()
  diaryId: number;
}

export class DiaryQuestionDTO {
  @ApiProperty({ example: 1, description: '일기-질문 매핑 아이디' })
  diaryQuestionId: number;

  @ApiProperty({ example: 1, description: '질문 아이디' })
  questionId: number;

  @ApiProperty({
    example: '오늘 가장 기억에 남는 순간은 무엇인가요?',
    description: '질문 내용',
  })
  questionContent: string;

  @ApiProperty({ example: 1, description: '일기 아이디' })
  diaryId: number;

  @ApiProperty({ example: true, description: '일기 작성 여부' })
  isWritten: boolean;

  constructor(entity: DiaryQuestionEntity) {
    this.diaryQuestionId = entity.diaryQuestionId;
    this.questionId = entity.question.questionId;
    this.questionContent = entity.question.content;
    this.diaryId = entity.diary.diaryId;
    this.isWritten = entity.isWritten;
  }
}
