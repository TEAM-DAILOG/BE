import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './users.dto';
import { GetMyProfileSwagger, UpdateMyProfileSwagger } from './users.swagger';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';
import { S3Service } from '../global/s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

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
  @UseInterceptors(FileInterceptor('profileImage'))
  async userUpdate(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const currentUser = await this.userService.findOneUserEntity(userId);
      if (currentUser.profileImageUrl) {
        await this.s3Service.deleteImage(currentUser.profileImageUrl);
      }
      updateUserDto.profileImageUrl =
        await this.s3Service.uploadProfileImage(file);
    }
    const data = await this.userService.updateUserEntity(userId, updateUserDto);

    return { message: '사용자 정보 수정 성공', data };
  }
}
