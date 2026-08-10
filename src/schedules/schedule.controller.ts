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
  UpdateScheduleCompletionDto,
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
    'repeatDates',
    'isLastDayOfMonth',
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
    repeatDates: {
      type: 'array',
      nullable: true,
      items: {
        type: 'string',
        format: 'date',
      },
      example: ['2026-07-17', '2026-07-20', '2026-07-25'],
      description:
        'MULTIPLE 일정의 동일 그룹 전체 날짜 목록이며, 그 외 반복 유형은 null입니다.',
    },
    isLastDayOfMonth: {
      type: 'boolean',
      example: false,
      description: '월간 반복 일정의 말일 설정 여부',
    },
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
    scheduleId: {
      type: 'integer',
      nullable: true,
      example: 1,
      description: '단일 일정이면 생성된 일정 ID, 반복 일정이면 null',
    },
    groupId: {
      type: 'integer',
      nullable: true,
      example: null,
      description: '반복 일정이면 생성된 반복 그룹 ID, 단일 일정이면 null',
    },
    createdCount: {
      type: 'integer',
      example: 1,
      description: '실제로 생성된 일정 수',
    },
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
    'isLastDayOfMonth',
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
    isLastDayOfMonth: {
      type: 'boolean',
      example: false,
      description: '월간 반복 일정의 말일 설정 여부',
    },
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

const updateScheduleCompletionDataSchema: SwaggerSchema = {
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
  '인증에 실패했습니다.',
);
const internalServerErrorResponseSchema = createErrorResponseSchema(
  500,
  'INTERNAL_SERVER_ERROR',
  '서버 내부 오류가 발생했습니다.',
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
@ApiExtraModels(
  CreateScheduleDto,
  UpdateScheduleDto,
  UpdateScheduleCompletionDto,
)
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
      'UTC 기준 내일부터 7일 후까지의 미완료 일정을 개수 제한 없이 조회합니다. 일정 날짜 오름차순으로 정렬하며, 날짜가 같으면 생성일시와 일정 ID 오름차순으로 정렬합니다.',
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
    description:
      '로그인한 사용자의 단일 일정 또는 반복 일정을 등록합니다. 사용자 ID는 액세스 토큰에서 확인하며, 새 일정의 완료 여부는 false로 저장됩니다. 반복 일정은 한 번의 요청으로 최대 365개까지 생성할 수 있습니다.',
  })
  @ApiCreatedResponse({
    description:
      '일정 등록 성공. 단일 일정은 scheduleId가 반환되고, 반복 일정은 groupId가 반환됩니다.',
    content: {
      'application/json': {
        schema: createSuccessResponseSchema(
          '일정 등록에 성공했습니다.',
          createScheduleDataSchema,
        ),
        examples: {
          none: {
            summary: 'NONE — 단일 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: 1,
                groupId: null,
                createdCount: 1,
              },
            },
          },
          multiple: {
            summary: 'MULTIPLE — 다중 날짜 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: null,
                groupId: 10,
                createdCount: 2,
              },
            },
          },
          period: {
            summary: 'PERIOD — 기간 반복 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: null,
                groupId: 11,
                createdCount: 6,
              },
            },
          },
          weekly: {
            summary: 'WEEKLY — 요일 반복 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: null,
                groupId: 12,
                createdCount: 14,
              },
            },
          },
          monthly: {
            summary: 'MONTHLY — 매월 반복 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: null,
                groupId: 13,
                createdCount: 5,
              },
            },
          },
          yearly: {
            summary: 'YEARLY — 매년 반복 일정',
            value: {
              resultType: 'SUCCESS',
              message: '일정 등록에 성공했습니다.',
              data: {
                scheduleId: null,
                groupId: 14,
                createdCount: 5,
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '필수 입력값 누락 또는 잘못된 요청 형식',
    schema: createErrorResponseSchema(
      400,
      'BAD_REQUEST',
      '필수 입력값이 누락되었거나 요청 형식이 올바르지 않습니다.',
    ),
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
        summary: 'NONE — 단일 일정',
        value: {
          categoryId: 2,
          title: '단일 일정 제목 예시',
          content: '단일 일정 내용 예시',
          date: '2026-07-15',
          repeatType: 'NONE',
        },
      },
      multiple: {
        summary: 'MULTIPLE — 다중 날짜 일정',
        value: {
          categoryId: 2,
          title: '다중 날짜 일정 제목 예시',
          content: '다중 날짜 일정 내용 예시',
          repeatType: 'MULTIPLE',
          repeatDates: ['2026-07-20', '2026-07-25'],
        },
      },
      period: {
        summary: 'PERIOD — 기간 반복 일정',
        value: {
          categoryId: 2,
          title: '기간 반복 일정 제목 예시',
          content: '기간 반복 일정 내용 예시',
          repeatType: 'PERIOD',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2026-07-20',
        },
      },
      weekly: {
        summary: 'WEEKLY — 요일 반복 일정',
        value: {
          categoryId: 2,
          title: '요일 반복 일정 제목 예시',
          content: '요일 반복 일정 내용 예시',
          repeatType: 'WEEKLY',
          repeatStartDate: '2026-07-15',
          repeatEndDate: '2026-08-15',
          repeatDays: 'MON,WED,FRI',
        },
      },
      monthly: {
        summary: 'MONTHLY — 매월 반복 일정',
        value: {
          categoryId: 1,
          title: '매월 15일 일정',
          content: null,
          repeatType: 'MONTHLY',
          repeatStartDate: '2026-01-15',
          repeatEndDate: '2026-05-31',
          isLastDayOfMonth: false,
        },
      },
      monthlyLastDay: {
        summary: 'MONTHLY — 매월 말일 반복 일정',
        value: {
          categoryId: 1,
          title: '월말 정산',
          content: null,
          repeatType: 'MONTHLY',
          repeatStartDate: '2026-01-31',
          repeatEndDate: '2026-05-31',
          isLastDayOfMonth: true,
        },
      },
      yearly: {
        summary: 'YEARLY — 매년 반복 일정',
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
          isLastDayOfMonth: false,
        },
      },
      allMonthlyLastDay: {
        summary: '반복 일정 ALL 월말 설정',
        value: {
          repeatType: 'MONTHLY',
          repeatStartDate: '2026-01-31',
          repeatEndDate: '2026-05-31',
          isLastDayOfMonth: true,
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
    summary: '일정 완료 상태 변경',
    description:
      '로그인한 사용자의 일정 한 건을 변경합니다. isCompleted가 true이면 완료 처리하고, false이면 완료를 취소합니다.',
  })
  @ApiOkResponse({
    description: '일정 완료 상태 변경 성공',
    schema: createSuccessResponseSchema(
      '일정 완료 상태 변경에 성공했습니다.',
      updateScheduleCompletionDataSchema,
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
    description: '완료 상태를 변경할 일정 ID',
  })
  @ApiBody({
    required: true,
    schema: {
      $ref: getSchemaPath(UpdateScheduleCompletionDto),
    },
    examples: {
      complete: {
        summary: '일정 완료 처리',
        value: {
          isCompleted: true,
        },
      },
      cancelCompletion: {
        summary: '일정 완료 취소',
        value: {
          isCompleted: false,
        },
      },
    },
  })
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
  @ApiOperation({
    summary: '일정 삭제',
    description:
      '로그인한 사용자의 일정을 삭제합니다. 반복 일정은 선택한 일정만 삭제하거나 동일한 반복 그룹 전체를 삭제할 수 있습니다. 단, PERIOD 타입의 기간 반복 일정은 scope=ALL로만 삭제할 수 있습니다.',
  })
  @ApiOkResponse({
    description: '일정 삭제 성공',
    schema: createSuccessResponseSchema(
      '일정 삭제에 성공했습니다.',
      deleteScheduleDataSchema,
    ),
  })
  @ApiBadRequestResponse({
    description:
      '삭제 scope DTO validation 실패 또는 PERIOD 일정의 SINGLE 삭제 요청',
    schema: {
      oneOf: [
        createErrorResponseSchema(
          400,
          'BAD_REQUEST',
          'scope must be one of the following values: SINGLE, ALL',
        ),
        createErrorResponseSchema(
          400,
          'BAD_REQUEST',
          '기간 반복 일정은 전체 삭제만 가능합니다.',
        ),
      ],
    },
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
    description:
      '삭제 범위입니다. PERIOD 타입의 기간 반복 일정은 ALL만 사용할 수 있습니다.',
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
