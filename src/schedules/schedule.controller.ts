import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthenticatedUser } from '../auth/auth.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateScheduleDto,
  DeleteScheduleScopeQueryDto,
  GetSchedulesQueryDto,
  ScheduleScopeQueryDto,
  UpdateScheduleCompletionDto,
  UpdateScheduleDto,
} from './schedule.dto';
import {
  CreateScheduleSwagger,
  DeleteScheduleSwagger,
  GetSchedulesSwagger,
  GetUpcomingSchedulesSwagger,
  ScheduleControllerSwagger,
  UpdateScheduleCompletionSwagger,
  UpdateScheduleSwagger,
} from './schedule.swagger';
import { ScheduleService } from './schedule.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ScheduleControllerSwagger()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @GetSchedulesSwagger()
  async getSchedules(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetSchedulesQueryDto,
  ) {
    const userId = request.user.userId;
    const schedules = await this.scheduleService.getSchedules(userId, query);
    return {
      message: '전체 일정 목록 조회에 성공했습니다.',
      data: { schedules },
    };
  }

  @Get('upcoming')
  @GetUpcomingSchedulesSwagger()
  async getUpcomingSchedules(@Req() request: AuthenticatedRequest) {
    const userId = request.user.userId;
    const schedules = await this.scheduleService.getUpcomingSchedules(userId);
    return {
      message: '가까운 일정 조회에 성공했습니다.',
      data: { schedules },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateScheduleSwagger()
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

  @Patch(':scheduleId')
  @HttpCode(HttpStatus.OK)
  @UpdateScheduleSwagger()
  async updateSchedule(
    @Req() request: AuthenticatedRequest,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Query() query: ScheduleScopeQueryDto,
    @Body() body: UpdateScheduleDto,
  ) {
    const data = await this.scheduleService.updateSchedule(
      request.user.userId,
      scheduleId,
      query.scope,
      body,
    );
    return {
      message: '일정 수정에 성공했습니다.',
      data,
    };
  }

  @Patch(':scheduleId/complete')
  @HttpCode(HttpStatus.OK)
  @UpdateScheduleCompletionSwagger()
  async updateScheduleCompletion(
    @Req() request: AuthenticatedRequest,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() body: UpdateScheduleCompletionDto,
  ) {
    const userId = request.user.userId;
    const result = await this.scheduleService.updateScheduleCompletion(
      userId,
      scheduleId,
      body.isCompleted,
    );
    return {
      message: '일정 완료 상태 변경에 성공했습니다.',
      data: result,
    };
  }

  @Delete(':scheduleId')
  @HttpCode(HttpStatus.OK)
  @DeleteScheduleSwagger()
  async deleteSchedule(
    @Req() request: AuthenticatedRequest,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Query() query: DeleteScheduleScopeQueryDto,
  ) {
    const userId = request.user.userId;
    const result = await this.scheduleService.deleteSchedule(
      userId,
      scheduleId,
      query.scope,
    );
    return {
      message: '일정 삭제에 성공했습니다.',
      data: result,
    };
  }
}
