import {
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { GetSchedulesQueryDto } from './schedule.dto';
import { ScheduleService } from './schedule.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
  };
}

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
  ) {}

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
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-07-31',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    example: 2,
  })
  @ApiQuery({
    name: 'isCompleted',
    required: false,
    type: Boolean,
    example: false,
  })
  async getSchedules(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetSchedulesQueryDto,
  ) {
    const userId = request.user.userId;

    const schedules = await this.scheduleService.getSchedules(
      userId,
      query,
    );

    return {
      message: '전체 일정 목록 조회에 성공했습니다.',
      data: {
        schedules,
      },
    };
  }
}