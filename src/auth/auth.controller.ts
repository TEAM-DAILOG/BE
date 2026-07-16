import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CheckSignupEmailDto,
  LoginDto,
  ReissueAccessTokenDto,
  SendPasswordResetEmailVerificationDto,
  SendSignupEmailVerificationDto,
  SignupDto,
  VerifyPasswordResetEmailDto,
  VerifySignupEmailDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/email/check')
  @HttpCode(200)
  checkSignupEmail(@Body() checkSignupEmailDto: CheckSignupEmailDto) {
    return this.authService.checkSignupEmail(checkSignupEmailDto);
  }

  @Post('signup/email/verification/send')
  @HttpCode(200)
  sendSignupEmailVerification(
    @Body() sendSignupEmailVerificationDto: SendSignupEmailVerificationDto,
  ) {
    return this.authService.sendSignupEmailVerification(
      sendSignupEmailVerificationDto,
    );
  }

  @Post('password/reset/email/verification/send')
  @HttpCode(200)
  sendPasswordResetEmailVerification(
    @Body() dto: SendPasswordResetEmailVerificationDto,
  ) {
    return this.authService.sendPasswordResetEmailVerification(dto);
  }

  @Post('password/reset/email/verification/verify')
  @HttpCode(200)
  verifyPasswordResetEmail(@Body() dto: VerifyPasswordResetEmailDto) {
    return this.authService.verifyPasswordResetEmail(dto);
  }

  @Post('signup/email/verification/verify')
  @HttpCode(200)
  verifySignupEmail(@Body() verifySignupEmailDto: VerifySignupEmailDto) {
    return this.authService.verifySignupEmail(verifySignupEmailDto);
  }

  @Post('signup')
  @HttpCode(201)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('token/reissue')
  @HttpCode(200)
  reissueAccessToken(@Body() reissueAccessTokenDto: ReissueAccessTokenDto) {
    return this.authService.reissueAccessToken(reissueAccessTokenDto);
  }
}
