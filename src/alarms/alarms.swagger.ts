import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

// 알람 설정 조회
export function FindOneAlarmSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '알람 설정 조회',
      description:
        '로그인한 사용자의 알림 설정을 조회한다.\n\n회원가입 시 모든 알림은 false로 설정된다.',
    }),
    ApiResponse({
      status: 200,
      description: '알람 설정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '알람 설정 조회 성공',
          data: {
            alarmId: 1,
            isPush: true,
            isDiary: true,
            isDiaryReply: false,
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '알림 설정을 찾을 수 없음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 알람 설정 수정
export function UpdateAlarmSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '알람 설정 수정',
      description:
        '로그인한 사용자의 알림 설정을 수정한다.\n\n모든 필드는 선택 사항입니다.\n\nisPush가 false면 isDiary, isDiaryReply도 자동으로 false로 수정됩니다.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          isPush: {
            type: 'boolean',
            description: 'PUSH 알람 여부',
            example: true,
          },
          isDiary: {
            type: 'boolean',
            description: '일기 작성 알람 여부',
            example: true,
          },
          isDiaryReply: {
            type: 'boolean',
            description: '일기 답장 알람 여부',
            example: false,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '알람 설정 수정 성공',
      content: {
        'application/json': {
          examples: {
            isPushTrue: {
              summary: 'isPush가 true인 경우',
              value: {
                resultType: 'SUCCESS',
                message: '알람 설정 수정 성공',
                data: {
                  alarmId: 1,
                  isPush: true,
                  isDiary: false,
                  isDiaryReply: true,
                },
              },
            },
            isPushFalse: {
              summary: 'isPush가 false인 경우 (나머지 알람 자동 OFF)',
              value: {
                resultType: 'SUCCESS',
                message: '알람 설정 수정 성공',
                data: {
                  alarmId: 1,
                  isPush: false,
                  isDiary: false,
                  isDiaryReply: false,
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '알림 설정을 찾을 수 없음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 리마인드 알람 설정 조회
export function FindOneReminderSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '리마인드 알람 설정 조회',
      description: '로그인한 사용자의 리마인드 알림 설정을 조회한다.(time은 KST 기준 HH:mm)',
    }),
    ApiResponse({
      status: 200,
      description: '리마인드 알람 설정 조회 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '리마인드 알람 설정 조회 성공',
          data: {
            reminderId: 1,
            days: ['MON', 'WED', 'FRI'],
            time: '21:30',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 404,
      description: '리마인드 알림 설정을 찾을 수 없음',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// 리마인드 알람 설정 수정
export function UpdateReminderSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: '리마인드 알람 설정 수정',
      description: '로그인한 사용자의 리마인드 알람 설정을 수정한다.(time은 KST 기준 HH:mm)',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          days: {
            type: 'array',
            items: { type: 'string' },
            description: '알람 요일 배열',
            example: ['MON', 'WED', 'FRI'],
          },
          time: {
            type: 'string',
            description: '알람 시간',
            example: '21:30:00+09:00',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '리마인드 알람 설정 수정 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '리마인드 알림 설정 수정 성공',
          data: {
            reminderId: 1,
            days: ['MON', 'WED', 'FRI'],
            time: '21:30',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '올바른 시간 형식이 아닙니다. (예: 21:30:00+09:00)',
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({
      status: 404,
      description: '리마인드 알림 설정을 찾을 수 없음',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// FCM 토큰 등록
export function RegisterPushTokenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'FCM 토큰 등록 (앱 로그인/실행 시)',
      description:
        '앱 로그인/실행 시 FCM 디바이스 토큰을 등록하고 업데이트합니다.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['fcmToken', 'deviceType'],
        properties: {
          fcmToken: {
            type: 'string',
            description: 'FCM 디바이스 토큰',
            example: 'eKxy1234...',
          },
          deviceType: {
            type: 'string',
            description: '디바이스 종류\n- IOS: 애플\n- ANDROID: 안드로이드',
            enum: ['IOS', 'ANDROID'],
            example: 'IOS',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'FCM 토큰 등록 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'FCM 토큰 등록 성공',
          data: {
            tokenId: 1,
            fcmToken: 'eKxy1234...',
            deviceType: 'IOS',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '해당 사용자를 찾을 수 없음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

// FCM 토큰 삭제
export function DeletePushTokenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'FCM 토큰 삭제 (앱 로그아웃 시)',
      description: '앱 로그아웃 시 FCM 디바이스 토큰을 삭제합니다.',
    }),
    ApiParam({ name: 'tokenId', type: Number, description: '삭제할 토큰 ID' }),
    ApiResponse({
      status: 200,
      description: 'FCM 토큰 삭제 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'FCM 토큰 삭제 성공',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 401, description: '사용자 인증 실패' }),
    ApiResponse({ status: 404, description: '해당 토큰을 찾을 수 없음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}
