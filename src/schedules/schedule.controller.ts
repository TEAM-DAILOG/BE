import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthenticatedUser } from '../auth/auth.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateScheduleDto, GetSchedulesQueryDto } from './schedule.dto';
import { ScheduleService } from './schedule.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Schedules')
@ApiBearerAuth('access-token')
@ApiExtraModels(CreateScheduleDto)
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({
    summary: '전체 일정 목록 조회',
    description:
      '로그인한 사용자의 일정을 날짜 범위, 카테고리, 완료 여부로 필터링하여 조회합니다.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-07-01',
    description: '조회 시작일',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-07-31',
    description: '조회 종료일',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    example: 2,
    description: '카테고리 ID',
  })
  @ApiQuery({
    name: 'isCompleted',
    required: false,
    type: Boolean,
    example: false,
    description: '완료 여부',
  })
  async getSchedules(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetSchedulesQueryDto,
  ) {
    const userId = request.user.userId;

    const schedules = await this.scheduleService.getSchedules(userId, query);

    return {
      message: '전체 일정 목록 조회에 성공했습니다.',
      data: {
        schedules,
      },
    };
  }

  @Get('upcoming')
  @ApiOperation({
    summary: '가까운 일정 조회',
    description:
      '오늘을 포함한 이후의 미완료 일정을 날짜 오름차순으로 최대 3개 조회합니다. 날짜가 같으면 생성일시와 일정 ID 오름차순으로 정렬합니다.',
  })
  async getUpcomingSchedules(@Req() request: AuthenticatedRequest) {
    const userId = request.user.userId;

    const schedules = await this.scheduleService.getUpcomingSchedules(userId);

    return {
      message: '가까운 일정 조회에 성공했습니다.',
      data: {
        schedules,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '일정 등록',
    description: '로그인한 사용자의 단일 일정 또는 반복 일정을 등록합니다.',
  })
  @ApiBody({
    schema: {
      $ref: getSchemaPath(CreateScheduleDto),
    },
    examples: {
      none: {
        summary: '단일 일정',
        value: {
          categoryId: 1,
          title: '단일 일정 제목 예시',
          content: '단일 일정 내용 예시',
          date: '2026-07-16',
          repeatType: 'NONE',
        },
      },
      multiple: {
        summary: '여러 날짜 일정',
        value: {
          categoryId: 1,
          title: '여러 날짜 일정',
          content: null,
          repeatType: 'MULTIPLE',
          repeatDates: ['2026-07-17', '2026-07-20', '2026-07-25'],
        },
      },
      period: {
        summary: '기간 반복 일정',
        value: {
          categoryId: 1,
          title: '매일 반복 일정',
          content: null,
          repeatType: 'PERIOD',
          repeatStartDate: '2026-07-17',
          repeatEndDate: '2026-07-20',
        },
      },
      weekly: {
        summary: '요일 반복 일정',
        value: {
          categoryId: 1,
          title: '요일 반복 일정',
          content: null,
          repeatType: 'WEEKLY',
          repeatStartDate: '2026-07-17',
          repeatEndDate: '2026-08-17',
          repeatDays: 'MON,WED,FRI',
        },
      },
    },
  })
  async createSchedule(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateScheduleDto,
  ) {
    const userId = request.user.userId;

    const result = await this.scheduleService.createSchedule(userId, body);

    return {
      message: '일정 등록에 성공했습니다.',
      data: result,
    };
  }
}
