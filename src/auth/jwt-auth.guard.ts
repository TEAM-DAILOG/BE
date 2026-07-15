import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../global/error/custom.exception';
import { AuthenticatedUser } from './auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    error: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    return user;
  }
}
