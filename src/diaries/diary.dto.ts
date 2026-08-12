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
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsNumber()
  questionId?: number;

  @IsOptional()
  images?: any;

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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

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
