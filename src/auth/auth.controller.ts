import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CheckCurrentPasswordDto,
  CheckSignupEmailDto,
  LoginDto,
  LogoutDto,
  ReissueAccessTokenDto,
  ResetPasswordDto,
  SendPasswordResetEmailVerificationDto,
  SendSignupEmailVerificationDto,
  SignupDto,
  VerifyPasswordResetEmailDto,
  VerifySignupEmailDto,
} from './auth.dto';
import { AccessTokenAuth, CurrentUserId } from './auth.decorator';
import {
  ChangePasswordSwagger,
  CheckCurrentPasswordSwagger,
  CheckSignupEmailSwagger,
  LoginSwagger,
  LogoutSwagger,
  ReissueAccessTokenSwagger,
  ResetPasswordSwagger,
  SendPasswordResetEmailVerificationSwagger,
  SendSignupEmailVerificationSwagger,
  SignupSwagger,
  VerifyPasswordResetEmailSwagger,
  VerifySignupEmailSwagger,
  WithdrawSwagger,
} from './auth.swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../global/s3/s3.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  @CheckSignupEmailSwagger()
  @Post('signup/email/check')
  @HttpCode(200)
  checkSignupEmail(@Body() checkSignupEmailDto: CheckSignupEmailDto) {
    return this.authService.checkSignupEmail(checkSignupEmailDto);
  }

  @SendSignupEmailVerificationSwagger()
  @Post('signup/email/verification/send')
  @HttpCode(200)
  sendSignupEmailVerification(
    @Body() sendSignupEmailVerificationDto: SendSignupEmailVerificationDto,
  ) {
    return this.authService.sendSignupEmailVerification(
      sendSignupEmailVerificationDto,
    );
  }

  @VerifySignupEmailSwagger()
  @Post('signup/email/verification/verify')
  @HttpCode(200)
  verifySignupEmail(@Body() verifySignupEmailDto: VerifySignupEmailDto) {
    return this.authService.verifySignupEmail(verifySignupEmailDto);
  }

  @SignupSwagger()
  @Post('signup')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('profileImage'))
  async signup(
    @Body() signupDto: SignupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let profileImageUrl: string | null = null;
    if (file) {
      profileImageUrl = await this.s3Service.uploadProfileImage(file);
    }
    return this.authService.signup({ ...signupDto, profileImageUrl });
  }

  @LoginSwagger()
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ReissueAccessTokenSwagger()
  @Post('token/reissue')
  @HttpCode(200)
  reissueAccessToken(@Body() reissueAccessTokenDto: ReissueAccessTokenDto) {
    return this.authService.reissueAccessToken(reissueAccessTokenDto);
  }

  @LogoutSwagger()
  @Post('logout')
  @AccessTokenAuth()
  @HttpCode(200)
  logout(@CurrentUserId() userId: number, @Body() dto: LogoutDto) {
    return this.authService.logout(userId, dto);
  }

  @WithdrawSwagger()
  @Delete('withdraw')
  @AccessTokenAuth()
  @HttpCode(200)
  withdraw(@CurrentUserId() userId: number) {
    return this.authService.withdraw(userId);
  }

  @ChangePasswordSwagger()
  @Patch('password')
  @AccessTokenAuth()
  @HttpCode(200)
  changePassword(
    @CurrentUserId() userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @CheckCurrentPasswordSwagger()
  @Post('password/check')
  @AccessTokenAuth()
  @HttpCode(200)
  checkCurrentPassword(
    @CurrentUserId() userId: number,
    @Body() dto: CheckCurrentPasswordDto,
  ) {
    return this.authService.checkCurrentPassword(userId, dto);
  }

  @SendPasswordResetEmailVerificationSwagger()
  @Post('password/reset/email/verification/send')
  @HttpCode(200)
  sendPasswordResetEmailVerification(
    @Body() dto: SendPasswordResetEmailVerificationDto,
  ) {
    return this.authService.sendPasswordResetEmailVerification(dto);
  }

  @VerifyPasswordResetEmailSwagger()
  @Post('password/reset/email/verification/verify')
  @HttpCode(200)
  verifyPasswordResetEmail(@Body() dto: VerifyPasswordResetEmailDto) {
    return this.authService.verifyPasswordResetEmail(dto);
  }

  @ResetPasswordSwagger()
  @Patch('password/reset')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
