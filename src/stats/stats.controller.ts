import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { StatsService } from './stats.service';
import { StatsMonthQueryDto } from './stats.dto';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';
import {
  GetMainStatsSwagger,
  GetScheduleDetailSwagger,
  GetPendingStatsSwagger,
  GetCompletedStatsSwagger,
} from './stats.swagger';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * 통계 메인 조회
   */
  @AccessTokenAuth()
  @GetMainStatsSwagger()
  @Get()
  async getMainStats(@CurrentUserId() userId: number) {
    const data = await this.statsService.getMainStats(userId);

    return {
      message: '통계 메인 조회 성공',
      data,
    };
  }

  /**
   * 일정 통계 상세 조회
   */
  @AccessTokenAuth()
  @GetScheduleDetailSwagger()
  @Get('detail')
  async getScheduleDetail(
    @CurrentUserId() userId: number,
    @Query() query: StatsMonthQueryDto,
  ) {
    const data = await this.statsService.getScheduleDetail(
      userId,
      query.year,
      query.month,
    );

    return {
      message: data.mostFrequentCategory
        ? '일정 통계 상세 조회 성공'
        : '해당 월 등록된 일정이 없습니다.',
      data,
    };
  }

  /**
   * 미완료 일정 조회
   */
  @AccessTokenAuth()
  @GetPendingStatsSwagger()
  @Get('schedules/pending')
  async getPendingStats(
    @CurrentUserId() userId: number,
    @Query() query: StatsMonthQueryDto,
  ) {
    const data = await this.statsService.getPendingStats(
      userId,
      query.year,
      query.month,
    );

    return { message: '미완료 일정 조회 성공', data };
  }

  /**
   * 완료된 일정 조회
   */
  @AccessTokenAuth()
  @GetCompletedStatsSwagger()
  @Get('schedules/completed')
  async getCompletedStats(
    @CurrentUserId() userId: number,
    @Query() query: StatsMonthQueryDto,
  ) {
    const data = await this.statsService.getCompletedStats(
      userId,
      query.year,
      query.month,
    );

    return { message: '완료된 일정 조회 성공', data };
  }
}
