import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckSignupEmailDto, LoginDto, SignupDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/email/check')
  @HttpCode(200)
  checkSignupEmail(@Body() checkSignupEmailDto: CheckSignupEmailDto) {
    return this.authService.checkSignupEmail(checkSignupEmailDto);
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
}
