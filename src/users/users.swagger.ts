import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

// 사용자 정보 조회
export function GetMyProfileSwagger() {
    return applyDecorators(
        ApiOperation({ summary: '사용자 정보 조회' }),
        ApiResponse({
            status: 200,
            description: '사용자 정보 조회 성공',
            schema: {
                example: {
                    resultType: 'SUCCESS',
                    message: '사용자 정보 조회 성공',
                    data: {
                        userId: 1,
                        email: 'test123@naver.com',
                        name: '홍길동',
                        profileImageUrl: 'https://s3.amazonaws.com/...',
                    },
                },
            },
        }),
        ApiResponse({ status: 401, description: '토큰이 없거나 유효하지 않음' }),
        ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' }),
        ApiResponse({ status: 500, description: '서버 내부 오류' }),
    );
}

// 사용자 정보 수정
export function UpdateMyProfileSwagger() {
    return applyDecorators(
        ApiOperation({ summary: '사용자 정보 수정' }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: '닉네임', example: '홍길동' },
                    email: { type: 'string', description: '이메일', example: 'dailog@naver.com' },
                    profileImageUrl: { type: 'string', nullable: true, description: '프로필 이미지 URL', example: 'https://s3.amazonaws.com/...' },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: '사용자 정보 수정 성공',
            schema: {
                example: {
                    resultType: 'SUCCESS',
                    message: '사용자 정보 수정 성공',
                    data: {
                        userId: 1,
                        email: 'dailog@naver.com',
                        name: '홍길동',
                        profileImageUrl: 'https://s3.amazonaws.com/...',
                    },
                },
            },
        }),
        ApiResponse({ status: 400, description: '잘못된 요청 (이미 사용 중인 이메일인 경우)' }),
        ApiResponse({ status: 401, description: '토큰이 없거나 유효하지 않음' }),
        ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' }),
        ApiResponse({ status: 500, description: '서버 내부 오류' }),
    );
}
