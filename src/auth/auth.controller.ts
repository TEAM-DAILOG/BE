import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CheckSignupEmailDto,
  LoginDto,
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
  CheckSignupEmailSwagger,
  LoginSwagger,
  ReissueAccessTokenSwagger,
  ResetPasswordSwagger,
  SendPasswordResetEmailVerificationSwagger,
  SendSignupEmailVerificationSwagger,
  SignupSwagger,
  VerifyPasswordResetEmailSwagger,
  VerifySignupEmailSwagger,
} from './auth.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
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
