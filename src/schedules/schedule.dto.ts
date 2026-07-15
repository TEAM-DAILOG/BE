import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
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

const REPEAT_TYPES = ['NONE', 'MULTIPLE', 'PERIOD', 'WEEKLY'] as const;
const SCHEDULE_SCOPES = ['SINGLE', 'ALL'] as const;

export class GetSchedulesQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
    description: '조회 시작일',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: '조회 종료일',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
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
    example: '계절학기 시험 준비',
    description: '일정 제목',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({
    example: '예제 문제 풀기',
    nullable: true,
    description: '일정 메모',
  })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiProperty({
    example: '2026-07-15',
    description: '일정 날짜',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @ApiProperty({
    enum: REPEAT_TYPES,
    example: 'NONE',
    description: '반복 유형',
  })
  @IsIn(REPEAT_TYPES)
  repeatType: (typeof REPEAT_TYPES)[number];

  @ApiPropertyOptional({
    example: '2026-07-15',
    nullable: true,
    description: '반복 시작일',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  repeatStartDate?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-31',
    nullable: true,
    description: '반복 종료일',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  repeatEndDate?: string | null;

  @ApiPropertyOptional({
    example: 'MON,WED,FRI',
    nullable: true,
    description: '반복 요일',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  repeatDays?: string | null;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

export class ScheduleScopeQueryDto {
  @ApiProperty({
    enum: SCHEDULE_SCOPES,
    example: 'SINGLE',
    description: '반복 일정 적용 범위',
  })
  @IsIn(SCHEDULE_SCOPES)
  scope: (typeof SCHEDULE_SCOPES)[number];
}
