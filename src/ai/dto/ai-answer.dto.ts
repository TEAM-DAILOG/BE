import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AnswerEntity } from '../entities/ai-answer.entity';

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
  @ApiProperty({ example: 'AI 답장의 id입니다' })
  answerId: number;

  @ApiProperty({ example: '일기의 Id 입니다' })
  diaryId: number;

  @ApiProperty({ example: 'AI 답장의 내용입니다' })
  answer: string;

  @ApiProperty({ example: 'AI 답장의 생성일자입니다' })
  createdAt: Date;

  constructor(answer: AnswerEntity) {
    this.answerId = answer.answerId;
    this.diaryId = answer.diary.diaryId;
    this.answer = answer.answer;
    this.createdAt = answer.createdAt;
  }
}

export class AIAnswerDTO {
  @ApiProperty({ example: 'AI 답장의 id입니다' })
  answerId: number;

  @ApiProperty({ example: 'AI 답장의 내용입니다' })
  answer: string;

  constructor(answer: AnswerEntity) {
    this.answerId = answer.answerId;
    this.answer = answer.answer;
  }
}
