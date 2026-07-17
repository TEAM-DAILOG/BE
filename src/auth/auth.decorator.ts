import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UnauthorizedException } from '../global/error/custom.exception';
import { AuthenticatedUser } from './auth.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

export function AccessTokenAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('access-token'),
  );
}

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.userId;

    if (userId === undefined || !Number.isInteger(userId) || userId < 1) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    return userId;
  },
);
