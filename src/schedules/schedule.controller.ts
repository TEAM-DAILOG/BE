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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
  type ApiResponseSchemaHost,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthenticatedUser } from '../auth/auth.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateScheduleDto,
  DeleteScheduleScopeQueryDto,
  GetSchedulesQueryDto,
  ScheduleScopeQueryDto,
  UpdateScheduleDto,
} from './schedule.dto';
import { ScheduleService } from './schedule.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

type SwaggerSchema = ApiResponseSchemaHost['schema'];

const scheduleItemSchema: SwaggerSchema = {
  type: 'object',
  required: [
    'scheduleId',
    'category',
    'title',
    'content',
    'date',
    'groupId',
    'isCompleted',
    'repeatType',
    'repeatStartDate',
    'repeatEndDate',
    'repeatDays',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    scheduleId: { type: 'integer', example: 1 },
    category: {
      type: 'object',
      required: ['categoryId', 'categoryName', 'categoryColor'],
      properties: {
        categoryId: { type: 'integer', example: 1 },
        categoryName: { type: 'string', example: '일상' },
        categoryColor: {
          type: 'string',
          enum: ['BLUE', 'BROWN', 'GREEN', 'PURPLE', 'PINK'],
          example: 'BLUE',
        },
      },
    },
    title: { type: 'string', example: '일정 제목' },
    content: { type: 'string', nullable: true, example: '일정 내용' },
    date: { type: 'string', format: 'date', example: '2026-07-20' },
    groupId: { type: 'integer', nullable: true, example: null },
    isCompleted: { type: 'boolean', example: false },
    repeatType: {
      type: 'string',
      enum: ['NONE', 'MULTIPLE', 'PERIOD', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      example: 'NONE',
    },
    repeatStartDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      example: null,
    },
    repeatEndDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      example: null,
    },
    repeatDays: { type: 'string', nullable: true, example: null },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-07-16T00:00:00.000Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      example: null,
    },
  },
};

const scheduleListDataSchema: SwaggerSchema = {
  type: 'object',
  required: ['schedules'],
  properties: {
    schedules: {
      type: 'array',
      items: scheduleItemSchema,
    },
  },
};

const createScheduleDataSchema: SwaggerSchema = {
  type: 'object',
  required: ['scheduleId', 'groupId', 'createdCount'],
  properties: {
    scheduleId: { type: 'integer', nullable: true, example: 1 },
    groupId: { type: 'integer', nullable: true, example: null },
    createdCount: { type: 'integer', example: 1 },
  },
};

const updateSingleScheduleDataSchema: SwaggerSchema = {
  type: 'object',
  required: [
    'scheduleId',
    'categoryId',
    'title',
    'content',
    'date',
    'groupId',
    'isCompleted',
    'repeatType',
    'repeatStartDate',
    'repeatEndDate',
    'repeatDays',
  ],
  properties: {
    scheduleId: { type: 'integer', example: 1 },
    categoryId: { type: 'integer', example: 1 },
    title: { type: 'string', example: '수정 제목' },
    content: { type: 'string', nullable: true, example: null },
    date: { type: 'string', format: 'date', example: '2026-07-20' },
    groupId: { type: 'integer', nullable: true, example: null },
    isCompleted: { type: 'boolean', example: false },
    repeatType: {
      type: 'string',
      enum: ['NONE', 'MULTIPLE', 'PERIOD', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      example: 'NONE',
    },
    repeatStartDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      example: null,
    },
    repeatEndDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      example: null,
    },
    repeatDays: { type: 'string', nullable: true, example: null },
  },
};

const updateAllSchedulesDataSchema: SwaggerSchema = {
  type: 'object',
  required: [
    'scheduleId',
    'groupId',
    'createdCount',
    'updatedCount',
    'deletedCount',
  ],
  properties: {
    scheduleId: { type: 'integer', nullable: true, example: null },
    groupId: { type: 'integer', nullable: true, example: 1 },
    createdCount: { type: 'integer', example: 1 },
    updatedCount: { type: 'integer', example: 2 },
    deletedCount: { type: 'integer', example: 1 },
  },
};

const updateScheduleDataSchema: SwaggerSchema = {
  oneOf: [updateSingleScheduleDataSchema, updateAllSchedulesDataSchema],
};

const completeScheduleDataSchema: SwaggerSchema = {
  type: 'object',
  required: ['scheduleId', 'isCompleted'],
  properties: {
    scheduleId: { type: 'integer', example: 1 },
    isCompleted: { type: 'boolean', example: true },
  },
};

const deleteScheduleDataSchema: SwaggerSchema = {
  type: 'object',
  required: ['scheduleId'],
  properties: {
    scheduleId: { type: 'integer', example: 1 },
  },
};

const createSuccessResponseSchema = (
  message: string,
  dataSchema: SwaggerSchema,
): SwaggerSchema => ({
  type: 'object',
  required: ['resultType', 'message', 'data'],
  properties: {
    resultType: {
      type: 'string',
      enum: ['SUCCESS'],
      example: 'SUCCESS',
    },
    message: { type: 'string', example: message },
    data: dataSchema,
  },
});

const createErrorResponseSchema = (
  code: number,
  errorCode: string,
  reason: string,
): SwaggerSchema => ({
  type: 'object',
  required: ['resultType', 'code', 'errorCode', 'reason', 'data'],
  properties: {
    resultType: { type: 'string', enum: ['FAIL'], example: 'FAIL' },
    code: { type: 'integer', example: code },
    errorCode: { type: 'string', example: errorCode },
    reason: { type: 'string', example: reason },
    data: { type: 'object', nullable: true, example: null },
  },
});

const unauthorizedResponseSchema = createErrorResponseSchema(
  401,
  'UNAUTHORIZED',
  '인증에 실패했습니다',
);
const internalServerErrorResponseSchema = createErrorResponseSchema(
  500,
  'INTERNAL_SERVER_ERROR',
  '서버 내부에 오류가 발생했습니다.',
);
const categoryNotFoundResponseSchema = createErrorResponseSchema(
  404,
  'CATEGORY_NOT_FOUND',
  '카테고리를 찾을 수 없습니다.',
);
const scheduleNotFoundResponseSchema = createErrorResponseSchema(
  404,
  'SCHEDULE_NOT_FOUND',
  '일정을 찾을 수 없습니다.',
);

@ApiTags('Schedules')
@ApiBearerAuth('access-token')
@ApiExtraModels(CreateScheduleDto, UpdateScheduleDto)
@ApiUnauthorizedResponse({
  description: '인증 실패',
  schema: unauthorizedResponseSchema,
})
@ApiInternalServerErrorResponse({
  description: '서버 내부 오류',
  schema: internalServerErrorResponseSchema,
})
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
  @ApiOkResponse({
    description: '전체 일정 목록 조회 성공',
    schema: createSuccessResponseSchema(
      '전체 일정 목록 조회에 성공했습니다.',
      scheduleListDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description: '잘못된 날짜 또는 날짜 범위',
    schema: createErrorResponseSchema(
      400,
      'INVALID_DATE_RANGE',
      '시작일은 종료일보다 늦을 수 없습니다.',
    ),
  })
  @ApiNotFoundResponse({
    description: '카테고리를 찾을 수 없음',
    schema: categoryNotFoundResponseSchema,
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
      '한국 시간 기준 내일부터 7일 후까지의 미완료 일정을 개수 제한 없이 조회합니다. 일정 날짜 오름차순으로 정렬하며, 날짜가 같으면 생성일시와 일정 ID 오름차순으로 정렬합니다.',
  })
  @ApiOkResponse({
    description: '가까운 일정 조회 성공',
    schema: createSuccessResponseSchema(
      '가까운 일정 조회에 성공했습니다.',
      scheduleListDataSchema,
    ),
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
  @ApiCreatedResponse({
    description: '일정 등록 성공',
    schema: createSuccessResponseSchema(
      '일정 등록에 성공했습니다.',
      createScheduleDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청, 반복 설정 오류, 날짜 오류 또는 365개 초과',
    schema: createErrorResponseSchema(400, 'BAD_REQUEST', '잘못된 요청입니다.'),
  })
  @ApiNotFoundResponse({
    description: '카테고리를 찾을 수 없음',
    schema: categoryNotFoundResponseSchema,
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
      monthly: {
        summary: '매월 반복 일정',
        value: {
          categoryId: 1,
          title: '매월 반복 일정',
          content: null,
          repeatType: 'MONTHLY',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2026-12-31',
        },
      },
      yearly: {
        summary: '매년 반복 일정',
        value: {
          categoryId: 1,
          title: '매년 반복 일정',
          content: null,
          repeatType: 'YEARLY',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2030-12-31',
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

  @Patch(':scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '일정 수정' })
  @ApiOkResponse({
    description: '일정 수정 성공',
    schema: createSuccessResponseSchema(
      '일정 수정에 성공했습니다.',
      updateScheduleDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description: '빈 요청, 잘못된 scope 또는 날짜·반복 설정 오류',
    schema: createErrorResponseSchema(
      400,
      'BAD_REQUEST',
      '수정할 정보를 한 개 이상 입력해야 합니다.',
    ),
  })
  @ApiNotFoundResponse({
    description: '일정 또는 카테고리를 찾을 수 없음',
    schema: {
      oneOf: [scheduleNotFoundResponseSchema, categoryNotFoundResponseSchema],
    },
  })
  @ApiParam({
    name: 'scheduleId',
    type: Number,
    example: 1,
    description: '수정할 일정 ID',
  })
  @ApiQuery({
    name: 'scope',
    required: true,
    enum: ['SINGLE', 'ALL'],
    example: 'SINGLE',
    description: '선택 일정만 수정하거나 반복 일정 전체를 수정합니다.',
  })
  @ApiBody({
    schema: { $ref: getSchemaPath(UpdateScheduleDto) },
    examples: {
      single: {
        summary: 'SINGLE 수정',
        value: { title: '수정 제목', content: null, date: '2026-07-16' },
      },
      all: {
        summary: '반복 일정 ALL 수정',
        value: {
          title: '매주 회의',
          repeatType: 'WEEKLY',
          repeatStartDate: '2026-07-01',
          repeatEndDate: '2026-08-31',
          repeatDays: 'MON,WED',
        },
      },
      allMonthly: {
        summary: '반복 일정 → MONTHLY 변경',
        value: {
          repeatType: 'MONTHLY',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2026-12-31',
        },
      },
      allYearly: {
        summary: '반복 일정 → YEARLY 변경',
        value: {
          repeatType: 'YEARLY',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2030-12-31',
        },
      },
      noneToWeekly: {
        summary: '단일 일정 NONE → WEEKLY 변경',
        value: {
          repeatType: 'WEEKLY',
          repeatStartDate: '2026-07-01',
          repeatEndDate: '2026-08-31',
          repeatDays: 'MON,WED',
        },
      },
      repeatToNone: {
        summary: '반복 일정 → NONE 변경',
        value: { repeatType: 'NONE', date: '2026-07-16' },
      },
    },
  })
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
  @ApiOperation({
    summary: '일정 완료 처리',
    description:
      '로그인한 사용자의 미완료 일정 한 건을 완료 상태로 변경합니다.',
  })
  @ApiOkResponse({
    description: '일정 완료 처리 성공',
    schema: createSuccessResponseSchema(
      '일정 완료 처리에 성공했습니다.',
      completeScheduleDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description: '이미 완료된 일정',
    schema: createErrorResponseSchema(
      400,
      'SCHEDULE_ALREADY_COMPLETED',
      '이미 완료 처리된 일정입니다.',
    ),
  })
  @ApiNotFoundResponse({
    description: '일정을 찾을 수 없음',
    schema: scheduleNotFoundResponseSchema,
  })
  @ApiParam({
    name: 'scheduleId',
    required: true,
    type: Number,
    example: 1,
    description: '완료 처리할 일정 ID',
  })
  async completeSchedule(
    @Req() request: AuthenticatedRequest,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    const userId = request.user.userId;

    const result = await this.scheduleService.completeSchedule(
      userId,
      scheduleId,
    );

    return {
      message: '일정 완료 처리에 성공했습니다.',
      data: result,
    };
  }

  @Delete(':scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '일정 삭제',
    description:
      '로그인한 사용자의 일정을 삭제합니다. 반복 일정은 선택한 일정만 삭제하거나 동일한 반복 그룹 전체를 삭제할 수 있습니다.',
  })
  @ApiOkResponse({
    description: '일정 삭제 성공',
    schema: createSuccessResponseSchema(
      '일정 삭제에 성공했습니다.',
      deleteScheduleDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description: '삭제 scope DTO validation 실패',
    schema: createErrorResponseSchema(
      400,
      'BAD_REQUEST',
      'scope must be one of the following values: SINGLE, ALL',
    ),
  })
  @ApiNotFoundResponse({
    description: '일정을 찾을 수 없음',
    schema: scheduleNotFoundResponseSchema,
  })
  @ApiParam({
    name: 'scheduleId',
    required: true,
    type: Number,
    example: 1,
    description: '삭제할 일정 ID',
  })
  @ApiQuery({
    name: 'scope',
    required: true,
    enum: ['SINGLE', 'ALL'],
    example: 'SINGLE',
    description: '삭제 범위',
  })
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
