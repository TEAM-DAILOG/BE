import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './users.dto';
import { GetMyProfileSwagger, UpdateMyProfileSwagger } from './users.swagger';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // 사용자 정보 조회
  @GetMyProfileSwagger()
  @AccessTokenAuth()
  @Get('/me')
  async getMyProfile(@CurrentUserId() userId: number) {
    const data = await this.userService.findOneUserEntity(userId);
    return { message: '사용자 정보 조회 성공', data };
  }

  // 사용자 정보 수정
  @UpdateMyProfileSwagger()
  @AccessTokenAuth()
  @Patch('/me')
  async userUpdate(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() userId: number,
  ) {
    const data = await this.userService.updateUserEntity(userId, updateUserDto);

    return { message: '사용자 정보 수정 성공', data };
  }
}
