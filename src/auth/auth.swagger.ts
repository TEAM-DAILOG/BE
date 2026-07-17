import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CheckSignupEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 회원가입 이메일 중복 체크' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            description: '중복 확인할 이메일',
            example: 'dailog@example.com',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '사용 가능한 이메일',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '사용 가능한 이메일입니다.',
          data: {
            isAvailable: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '이메일 형식이 올바르지 않거나 이미 가입된 이메일',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function SendSignupEmailVerificationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 회원가입 이메일 인증번호 전송' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            description: '인증번호를 받을 이메일',
            example: 'dailog@example.com',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '인증번호 전송 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '인증번호를 전송했습니다.',
          data: {
            expiresInSeconds: 300,
            resendAvailableInSeconds: 60,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '이메일 형식이 올바르지 않거나 이미 가입된 이메일',
    }),
    ApiResponse({
      status: 429,
      description: '인증번호 재전송 대기 시간 미경과',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function VerifySignupEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 회원가입 이메일 인증번호 검증' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: {
            type: 'string',
            description: '인증번호를 받은 이메일',
            example: 'dailog@example.com',
          },
          code: {
            type: 'string',
            description: '6자리 이메일 인증번호',
            example: '123456',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '이메일 인증 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '이메일 인증에 성공했습니다.',
          data: {
            emailVerificationToken: 'email-verification-token',
            expiresInSeconds: 1800,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 인증번호 또는 만료된 인증번호',
    }),
    ApiResponse({ status: 429, description: '인증 시도 횟수 초과' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function SignupSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 회원가입' }),
    ApiBody({
      schema: {
        type: 'object',
        required: [
          'email',
          'emailVerificationToken',
          'password',
          'name',
          'termsOfServiceAgreed',
          'privacyPolicyAgreed',
        ],
        properties: {
          email: {
            type: 'string',
            description: '이메일',
            example: 'dailog@example.com',
          },
          emailVerificationToken: {
            type: 'string',
            description: '이메일 인증 성공 후 발급된 토큰',
            example: 'email-verification-token',
          },
          password: {
            type: 'string',
            description:
              '영어, 숫자, 특수문자를 포함한 8자 이상 16자 이하 비밀번호',
            example: 'Password123!',
          },
          name: {
            type: 'string',
            description: '닉네임',
            example: '홍길동',
          },
          profileImageUrl: {
            type: 'string',
            nullable: true,
            description: '프로필 이미지 URL',
            example: 'https://s3.amazonaws.com/profile.png',
          },
          termsOfServiceAgreed: {
            type: 'boolean',
            description: '서비스 이용약관 동의 여부',
            example: true,
          },
          privacyPolicyAgreed: {
            type: 'boolean',
            description: '개인정보 처리방침 동의 여부',
            example: true,
          },
          marketingAgreed: {
            type: 'boolean',
            nullable: true,
            description: '마케팅 수신 동의 여부',
            example: false,
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '회원가입 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '회원가입에 성공했습니다.',
          data: {
            userId: 1,
            email: 'dailog@example.com',
            name: '홍길동',
            profileImageUrl: 'https://s3.amazonaws.com/profile.png',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 또는 유효하지 않은 이메일 인증 정보',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 로그인' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            description: '이메일',
            example: 'dailog@example.com',
          },
          password: {
            type: 'string',
            description: '비밀번호',
            example: 'Password123!',
          },
          deviceId: {
            type: 'string',
            nullable: true,
            description: '디바이스 식별자',
            example: 'device-id-1234',
          },
          deviceType: {
            type: 'string',
            nullable: true,
            description: '디바이스 종류',
            enum: ['IOS', 'ANDROID'],
            example: 'IOS',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '로그인 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '로그인에 성공했습니다.',
          data: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: {
              userId: 1,
              email: 'dailog@example.com',
              name: '홍길동',
              profileImageUrl: 'https://s3.amazonaws.com/profile.png',
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '인증 실패' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function ReissueAccessTokenSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Access Token 재발급' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            description: 'Refresh Token',
            example: 'refresh-token',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Access Token 재발급 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: 'Access Token 재발급에 성공했습니다.',
          data: {
            accessToken: 'new-access-token',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: '토큰이 없거나 유효하지 않음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function SendPasswordResetEmailVerificationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 비밀번호 찾기 인증번호 전송' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            description: '비밀번호 재설정 인증번호를 받을 이메일',
            example: 'dailog@example.com',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '가입된 이메일인 경우 인증번호 전송',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '가입된 이메일인 경우 인증번호를 전송했습니다.',
          data: {
            expiresInSeconds: 300,
            resendAvailableInSeconds: 60,
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: '이메일 형식이 올바르지 않음' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function VerifyPasswordResetEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 비밀번호 찾기 인증번호 검증' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: {
            type: 'string',
            description: '인증번호를 받은 이메일',
            example: 'dailog@example.com',
          },
          code: {
            type: 'string',
            description: '6자리 이메일 인증번호',
            example: '123456',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '비밀번호 재설정 이메일 인증 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '이메일 인증에 성공했습니다.',
          data: {
            passwordResetToken: 'password-reset-token',
            expiresInSeconds: 1800,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 인증번호 또는 만료된 인증번호',
    }),
    ApiResponse({ status: 429, description: '인증 시도 횟수 초과' }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function ResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '자체 비밀번호 재설정' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'passwordResetToken', 'newPassword'],
        properties: {
          email: {
            type: 'string',
            description: '비밀번호를 재설정할 이메일',
            example: 'dailog@example.com',
          },
          passwordResetToken: {
            type: 'string',
            description: '비밀번호 찾기 인증 성공 후 발급된 토큰',
            example: 'password-reset-token',
          },
          newPassword: {
            type: 'string',
            description:
              '영어, 숫자, 특수문자를 포함한 8자 이상 16자 이하 새 비밀번호',
            example: 'Newpassword123!',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '비밀번호 재설정 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '비밀번호가 재설정되었습니다.',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 또는 유효하지 않은 비밀번호 재설정 정보',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}

export function ChangePasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: '비밀번호 변경' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            description: '현재 비밀번호',
            example: 'Password123!',
          },
          newPassword: {
            type: 'string',
            description:
              '영어, 숫자, 특수문자를 포함한 8자 이상 16자 이하 새 비밀번호',
            example: 'Newpassword123!',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '비밀번호 변경 성공',
      schema: {
        example: {
          resultType: 'SUCCESS',
          message: '비밀번호가 변경되었습니다.',
          data: null,
        },
      },
    }),
    ApiResponse({ status: 400, description: '비밀번호 조건이 올바르지 않음' }),
    ApiResponse({
      status: 401,
      description: '토큰이 없거나 유효하지 않거나 현재 비밀번호 불일치',
    }),
    ApiResponse({ status: 500, description: '서버 내부 오류' }),
  );
}
