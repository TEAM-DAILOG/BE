import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { Transform } from 'class-transformer';
import { ToLocalDate } from '../global/decorators/date.decorator';

// 일기 작성 요청 DTO
export class CreateDiaryDto {
  @ApiProperty({
    description: '일기 제목',
    example: '오늘 하루',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    description: '일기 내용',
    example: '오늘 친구와 산책했다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: '질문일기인 경우 질문 ID (자유일기인 경우 null)',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsNumber()
  questionId?: number;

  @ApiPropertyOptional({
    description: '업로드 이미지',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  @IsOptional()
  images?: any;

  @ApiProperty({
    example: '2026-07-28T00:30:00+09:00',
    description: '사용자 로컬 기준 작성 시각',
  })
  @IsString()
  @IsNotEmpty()
  @ToLocalDate()
  date: string;
}

// 일기 작성 응답 DTO
export class CreateDiaryResponseDto {
  diaryId: number;
  userId: number;
  date: string | null;
  diaryType: string;
  diaryTitle: string;
  content: string;
  aiSummary: string | null;
}

// 일기 수정 요청 DTO
export class UpdateDiaryDto {
  @ApiPropertyOptional({
    description: '일기 제목',
    example: '수정된 제목',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({
    description: '일기 내용',
    example: '수정된 내용',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    description: '수정된 이미지 URL 목록',
    type: [String],
    example: [
      'https://s3.amazonaws.com/image1.jpg',
      'https://s3.amazonaws.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// 목록 조회 응답 DTO
export class DiaryListResponseDto {
  diaryId: number;
  userId: number;
  date: string | null;
  diaryType: string;
  diaryTitle: string;
  content: string;
  aiSummary: string | null;
  images: string[];
}

// 상세 조회 응답 DTO
export class DiaryDetailResponseDto {
  diaryId: number;
  userId: number;
  date: string | null;
  diaryType: string;
  diaryTitle: string;
  content: string;
  aiSummary: string | null;
  questionContent: string | null;
  images: string[];
}
