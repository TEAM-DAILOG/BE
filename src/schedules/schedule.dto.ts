import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';

import { RepeatType } from './schedule-repeat-group.entity';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SCHEDULE_SCOPES = ['SINGLE', 'ALL'] as const;

export class GetSchedulesQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
    description: '조회 시작일',
  })
  @IsOptional()
  @Matches(DATE_PATTERN)
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: '조회 종료일',
  })
  @IsOptional()
  @Matches(DATE_PATTERN)
  endDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: '카테고리 ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({
    example: false,
    description: '일정 완료 여부',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  })
  @IsBoolean()
  isCompleted?: boolean;
}

export class CreateScheduleDto {
  @ApiProperty({
    example: 1,
    description: '카테고리 ID',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    example: '일정제목예시',
    description: '일정 제목',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({
    example: '일정메모예시',
    nullable: true,
    description: '일정 메모',
  })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiPropertyOptional({
    example: '2026-07-15',
    nullable: true,
    description:
      '단일 일정 날짜입니다. repeatType이 NONE인 경우에만 필수입니다.',
  })
  @IsOptional()
  @Matches(DATE_PATTERN, {
    message: 'date는 YYYY-MM-DD 형식이어야 합니다.',
  })
  date?: string | null;

  @ApiProperty({
    enum: RepeatType,
    example: RepeatType.NONE,
    description: '반복 유형',
  })
  @IsEnum(RepeatType)
  repeatType: RepeatType;

  @ApiPropertyOptional({
    example: '2026-07-15',
    nullable: true,
    description:
      '반복 시작일입니다. PERIOD 또는 WEEKLY인 경우 필수입니다.',
  })
  @IsOptional()
  @Matches(DATE_PATTERN, {
    message:
      'repeatStartDate는 YYYY-MM-DD 형식이어야 합니다.',
  })
  repeatStartDate?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-31',
    nullable: true,
    description:
      '반복 종료일입니다. PERIOD 또는 WEEKLY인 경우 필수입니다.',
  })
  @IsOptional()
  @Matches(DATE_PATTERN, {
    message:
      'repeatEndDate는 YYYY-MM-DD 형식이어야 합니다.',
  })
  repeatEndDate?: string | null;

  @ApiPropertyOptional({
    example: 'MON,WED,FRI',
    nullable: true,
    maxLength: 50,
    description:
      '반복 요일입니다. WEEKLY인 경우 필수이며 쉼표로 구분합니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  repeatDays?: string | null;

  @ApiPropertyOptional({
    example: [
      '2026-07-15',
      '2026-07-18',
      '2026-07-22',
    ],
    nullable: true,
    type: [String],
    description:
      '직접 선택한 반복 날짜 목록입니다. MULTIPLE인 경우 필수입니다.',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(DATE_PATTERN, {
    each: true,
    message:
      'repeatDates의 각 값은 YYYY-MM-DD 형식이어야 합니다.',
  })
  repeatDates?: string[] | null;
}

export class UpdateScheduleDto extends PartialType(
  CreateScheduleDto,
) {}

export class ScheduleScopeQueryDto {
  @ApiProperty({
    enum: SCHEDULE_SCOPES,
    example: 'SINGLE',
    description: '반복 일정 적용 범위',
  })
  @IsIn(SCHEDULE_SCOPES)
  scope: (typeof SCHEDULE_SCOPES)[number];
}
