import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '../global/error/custom.exception';
import { UserService } from '../users/user.service';
import { CheckSignupEmailDto, SignupDto } from './auth.dto';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async checkSignupEmail({ email }: CheckSignupEmailDto) {
    const normalizedEmail = this.normalizeEmail(email);

    await this.validateSignupEmail(normalizedEmail);

    return {
      message: '사용 가능한 이메일입니다.',
      data: {
        isAvailable: true,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    const email = this.normalizeEmail(signupDto.email);
    const name = this.normalizeName(signupDto.name);
    const profileImageUrl = this.normalizeOptionalString(
      signupDto.profileImageUrl,
    );

    await this.validateSignupEmail(email);
    this.validatePassword(signupDto.password);
    this.validateRequiredAgreements(signupDto);

    const hashedPassword = await bcrypt.hash(
      signupDto.password,
      BCRYPT_SALT_ROUNDS,
    );
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      name,
      profileImageUrl,
    });
    await this.userService.createSignupAgreements({
      user,
      termsOfServiceAgreed: signupDto.termsOfServiceAgreed,
      privacyPolicyAgreed: signupDto.privacyPolicyAgreed,
      marketingAgreed: signupDto.marketingAgreed,
    });

    return {
      message: '회원가입에 성공했습니다.',
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
      },
    };
  }

  private async validateSignupEmail(email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('이메일 형식이 올바르지 않습니다');
    }

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다');
    }
  }

  private validatePassword(password: string): void {
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      throw new BadRequestException('비밀번호 조건이 올바르지 않습니다');
    }
  }

  private validateRequiredAgreements({
    termsOfServiceAgreed,
    privacyPolicyAgreed,
  }: SignupDto): void {
    if (termsOfServiceAgreed !== true || privacyPolicyAgreed !== true) {
      throw new BadRequestException('필수 약관에 동의해야 합니다');
    }
  }

  private normalizeEmail(email: string): string {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  private normalizeName(name: string): string {
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (normalizedName.length === 0) {
      throw new BadRequestException('닉네임을 입력해주세요');
    }

    return normalizedName;
  }

  private normalizeOptionalString(value?: string | null): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
