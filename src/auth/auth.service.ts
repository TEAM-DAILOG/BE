import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { AlarmService } from '../alarms/services/alarms.service';
import { CategoryService } from '../categories/category.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '../global/error/custom.exception';
import { RefreshTokenEntity } from '../users/entities/refresh-token.entity';
import { UserService } from '../users/user.service';
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
import {
  EMAIL_VERIFICATION_POLICY,
  EmailVerificationService,
} from './email-verification.service';

const BCRYPT_SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '14d';
const REFRESH_TOKEN_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000;
const DUMMY_PASSWORD_HASH =
  '$2b$10$MgTW7kAnV06Ef1oI8wAtbenaFF9594ASF7d5.c42.TGHtiOYh/gsm';

interface RefreshTokenPayload {
  sub: number;
  email: string | null;
  jti: string;
  credentialsChangedAt: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly alarmService: AlarmService,
    private readonly categoryService: CategoryService,
  ) {}

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

  async sendSignupEmailVerification({ email }: SendSignupEmailVerificationDto) {
    const normalizedEmail = this.normalizeEmail(email);

    await this.validateSignupEmail(normalizedEmail);
    const data =
      await this.emailVerificationService.sendSignupVerification(
        normalizedEmail,
      );

    return {
      message: '인증번호를 전송했습니다.',
      data,
    };
  }

  async sendPasswordResetEmailVerification({
    email,
  }: SendPasswordResetEmailVerificationDto) {
    const normalizedEmail = this.normalizeEmail(email);

    if (!this.isValidEmail(normalizedEmail)) {
      throw new BadRequestException('이메일 형식이 올바르지 않습니다');
    }

    const user = await this.userService.findActiveLocalByEmail(normalizedEmail);
    this.emailVerificationService.queuePasswordResetVerification(
      normalizedEmail,
      user !== null,
    );
    const data = {
      expiresInSeconds: EMAIL_VERIFICATION_POLICY.codeExpiresInSeconds,
      resendAvailableInSeconds: EMAIL_VERIFICATION_POLICY.resendCooldownSeconds,
    };

    return {
      message: '가입된 이메일인 경우 인증번호를 전송했습니다.',
      data,
    };
  }

  async verifyPasswordResetEmail({ email, code }: VerifyPasswordResetEmailDto) {
    const normalizedEmail = this.normalizeEmail(email);
    const data = await this.emailVerificationService.verifyPasswordResetCode(
      normalizedEmail,
      code,
    );

    return { message: '이메일 인증에 성공했습니다.', data };
  }

  async resetPassword({
    email,
    passwordResetToken,
    newPassword,
  }: ResetPasswordDto) {
    const normalizedEmail = this.normalizeEmail(email);

    this.validatePassword(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await this.dataSource.transaction(async (manager) => {
      await this.emailVerificationService.consumePasswordResetVerification(
        normalizedEmail,
        passwordResetToken,
        manager,
      );

      const user = await this.userService.findActiveLocalByEmail(
        normalizedEmail,
        manager,
      );

      if (!user) {
        throw new BadRequestException(
          '비밀번호 재설정 정보가 유효하지 않습니다.',
        );
      }

      const credentialsChangedAt = new Date();
      await this.userService.updatePassword(
        user,
        hashedPassword,
        credentialsChangedAt,
        manager,
      );
      await this.userService.revokeAllRefreshTokens(
        user.userId,
        credentialsChangedAt,
        manager,
      );
    });

    return {
      message: '비밀번호가 재설정되었습니다.',
      data: null,
    };
  }

  async changePassword(
    userId: number,
    { currentPassword, newPassword }: ChangePasswordDto,
  ) {
    this.validatePassword(newPassword);
    const user = await this.userService.findActiveLocalById(userId);

    if (
      !user ||
      typeof user.password !== 'string' ||
      user.password.length === 0
    ) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    const credentialsChangedAt = new Date();

    await this.dataSource.transaction(async (manager) => {
      await this.userService.updatePassword(
        user,
        hashedPassword,
        credentialsChangedAt,
        manager,
      );
      await this.userService.revokeAllRefreshTokens(
        user.userId,
        credentialsChangedAt,
        manager,
      );
    });

    return {
      message: '비밀번호가 변경되었습니다.',
      data: null,
    };
  }

  async verifySignupEmail({ email, code }: VerifySignupEmailDto) {
    const normalizedEmail = this.normalizeEmail(email);

    await this.validateSignupEmail(normalizedEmail);
    const data = await this.emailVerificationService.verifySignupCode(
      normalizedEmail,
      code,
    );

    return {
      message: '이메일 인증에 성공했습니다.',
      data,
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

    const user = await this.dataSource.transaction(async (manager) => {
      // await this.emailVerificationService.consumeSignupVerification(
      //   email,
      //   signupDto.emailVerificationToken,
      //   manager,
      // );

      const createdUser = await this.userService.createUser(
        {
          email,
          password: hashedPassword,
          name,
          profileImageUrl,
        },
        manager,
      );

      await this.userService.createSignupAgreements(
        {
          user: createdUser,
          termsOfServiceAgreed: signupDto.termsOfServiceAgreed,
          privacyPolicyAgreed: signupDto.privacyPolicyAgreed,
          pushNotificationAgreed: signupDto.pushNotificationAgreed ?? null,
        },
        manager,
      );

      await this.alarmService.createDefaultAlarm(createdUser, manager);

      await this.categoryService.createDefaultCategory(
        createdUser.userId,
        manager,
      );

      return createdUser;
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

  async login(loginDto: LoginDto) {
    const email = this.normalizeEmail(loginDto.email);
    const user = await this.userService.findActiveByEmail(email);
    const userPassword = user?.password;
    const hasUserPassword =
      typeof userPassword === 'string' && userPassword.length > 0;
    const passwordHash = hasUserPassword ? userPassword : DUMMY_PASSWORD_HASH;

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      passwordHash,
    );

    if (!user || !hasUserPassword || !isPasswordValid) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    await this.userService.createRefreshToken({
      user,
      tokenHash: this.hashToken(refreshToken),
      deviceId: this.normalizeOptionalString(loginDto.deviceId),
      deviceType: loginDto.deviceType ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
    });

    return {
      message: '로그인에 성공했습니다.',
      data: {
        accessToken,
        refreshToken,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          profileImageUrl: user.profileImageUrl,
        },
      },
    };
  }

  async reissueAccessToken({ refreshToken }: ReissueAccessTokenDto) {
    const payload = await this.verifyRefreshToken(refreshToken);

    const storedRefreshToken = await this.userService.findRefreshTokenByHash(
      this.hashToken(refreshToken),
    );

    if (
      !this.isUsableRefreshToken(storedRefreshToken) ||
      payload.sub !== storedRefreshToken.user.userId ||
      !this.isRefreshTokenCredentialsMarkerValid(
        payload,
        storedRefreshToken.user,
      )
    ) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }

    const accessToken = await this.signAccessToken(storedRefreshToken.user);

    return {
      message: 'Access Token 재발급에 성공했습니다.',
      data: {
        accessToken,
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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async signAccessToken(user: {
    userId: number;
    email: string | null;
  }) {
    return this.jwtService.signAsync(
      { sub: user.userId, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
  }

  private async signRefreshToken(user: {
    userId: number;
    email: string | null;
    credentialsChangedAt: Date | null;
  }) {
    return this.jwtService.signAsync(
      {
        sub: user.userId,
        email: user.email,
        jti: randomUUID(),
        credentialsChangedAt: this.getCredentialsChangedAtMarker(user),
      } satisfies RefreshTokenPayload,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (!this.isRefreshTokenPayload(payload)) {
        throw new UnauthorizedException('인증에 실패했습니다');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('인증에 실패했습니다');
    }
  }

  private isRefreshTokenPayload(
    payload: unknown,
  ): payload is RefreshTokenPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'email' in payload &&
      'jti' in payload &&
      'credentialsChangedAt' in payload &&
      typeof payload.sub === 'number' &&
      (typeof payload.email === 'string' || payload.email === null) &&
      typeof payload.jti === 'string' &&
      (typeof payload.credentialsChangedAt === 'number' ||
        payload.credentialsChangedAt === null)
    );
  }

  private isRefreshTokenCredentialsMarkerValid(
    payload: RefreshTokenPayload,
    user: { credentialsChangedAt: Date | null },
  ): boolean {
    return (
      payload.credentialsChangedAt === this.getCredentialsChangedAtMarker(user)
    );
  }

  private getCredentialsChangedAtMarker(user: {
    credentialsChangedAt: Date | null;
  }): number | null {
    return user.credentialsChangedAt?.getTime() ?? null;
  }

  private isUsableRefreshToken(
    refreshToken: RefreshTokenEntity | null,
  ): refreshToken is RefreshTokenEntity {
    return (
      refreshToken !== null &&
      typeof refreshToken.user?.userId === 'number' &&
      refreshToken.revokedAt === null &&
      refreshToken.expiresAt.getTime() > Date.now()
    );
  }
}
