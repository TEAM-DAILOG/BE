import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AnswerEntity } from '../entities/ai-answer.entity';
import { toIsoDateTime } from '../../global/date.util';

export class AIAnswerCreateRequestDTO {
  @ApiProperty({ example: '일기의 제목입니다' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '일기의 내용입니다' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AIanswercreateResponseDTO {
  answerId: number;

  diaryId: number;

  answer: string;

  createdAt: string;

  constructor(answer: AnswerEntity) {
    this.answerId = answer.answerId;
    this.diaryId = answer.diary.diaryId;
    this.answer = answer.answer;
    this.createdAt = toIsoDateTime(answer.createdAt);
  }
}

export class AIAnswerDTO {
  answerId: number;

  answer: string;

  constructor(answer: AnswerEntity) {
    this.answerId = answer.answerId;
    this.answer = answer.answer;
  }
}
