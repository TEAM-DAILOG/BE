import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerException,
  TooManyRequestsException,
} from '../global/error/custom.exception';
import { MailService } from '../global/mail/mail.service';
import {
  EmailVerificationEntity,
  EmailVerificationPurpose,
} from './entities/email-verification.entity';

export const EMAIL_VERIFICATION_POLICY = {
  codeExpiresInSeconds: 5 * 60,
  maxFailedAttempts: 5,
  resendCooldownSeconds: 60,
  verificationTokenExpiresInSeconds: 30 * 60,
} as const;

const CODE_EXPIRES_IN_SECONDS = EMAIL_VERIFICATION_POLICY.codeExpiresInSeconds;
const MAX_FAILED_ATTEMPTS = EMAIL_VERIFICATION_POLICY.maxFailedAttempts;
const RESEND_COOLDOWN_SECONDS = EMAIL_VERIFICATION_POLICY.resendCooldownSeconds;
const VERIFICATION_TOKEN_EXPIRES_IN_SECONDS =
  EMAIL_VERIFICATION_POLICY.verificationTokenExpiresInSeconds;

export interface SendVerificationResult {
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

export interface VerifySignupCodeResult {
  emailVerificationToken: string;
  expiresInSeconds: number;
}

interface IssuedVerification {
  emailVerificationId: number;
  code: string;
  codeHash: string;
}

type VerifyTransactionResult =
  | {
      kind: 'success';
      verificationToken: string;
    }
  | {
      kind: 'bad-request';
      reason: string;
      data: unknown;
    }
  | {
      kind: 'too-many-requests';
      reason: string;
      data: unknown;
    };

interface VerifyCodeResult {
  verificationToken: string;
  expiresInSeconds: number;
}

export interface VerifyPasswordResetCodeResult {
  passwordResetToken: string;
  expiresInSeconds: number;
}

@Injectable()
export class EmailVerificationService {
  private readonly verificationSecret: string;

  constructor(
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.verificationSecret = this.configService.getOrThrow<string>(
      'EMAIL_VERIFICATION_SECRET',
    );
  }

  async sendSignupVerification(email: string): Promise<SendVerificationResult> {
    const issuedVerification = await this.issueVerification(
      email,
      EmailVerificationPurpose.SIGNUP,
    );
    await this.deliverVerificationCode(issuedVerification, () =>
      this.mailService.sendSignupVerificationCode(
        email,
        issuedVerification.code,
      ),
    );

    return this.createSendVerificationResult();
  }

  async sendPasswordResetVerification(
    email: string,
  ): Promise<SendVerificationResult> {
    try {
      const issuedVerification = await this.issueVerification(
        email,
        EmailVerificationPurpose.PASSWORD_RESET,
      );
      await this.deliverVerificationCode(issuedVerification, () =>
        this.mailService.sendPasswordResetVerificationCode(
          email,
          issuedVerification.code,
        ),
      );
    } catch (error) {
      if (
        error instanceof TooManyRequestsException ||
        error instanceof BadRequestException
      ) {
        return this.createSendVerificationResult();
      }

      throw error;
    }

    return this.createSendVerificationResult();
  }

  async verifySignupCode(
    email: string,
    code: string,
  ): Promise<VerifySignupCodeResult> {
    const result = await this.verifyCode(
      email,
      code,
      EmailVerificationPurpose.SIGNUP,
    );

    return {
      emailVerificationToken: result.verificationToken,
      expiresInSeconds: result.expiresInSeconds,
    };
  }

  async verifyPasswordResetCode(
    email: string,
    code: string,
  ): Promise<VerifyPasswordResetCodeResult> {
    try {
      const result = await this.verifyCode(
        email,
        code,
        EmailVerificationPurpose.PASSWORD_RESET,
      );

      return {
        passwordResetToken: result.verificationToken,
        expiresInSeconds: result.expiresInSeconds,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof TooManyRequestsException
      ) {
        throw new BadRequestException(
          '인증번호가 올바르지 않거나 만료되었습니다.',
        );
      }

      throw error;
    }
  }

  private async verifyCode(
    email: string,
    code: string,
    purpose: EmailVerificationPurpose,
  ): Promise<VerifyCodeResult> {
    const result = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(EmailVerificationEntity);
      const verification = await repository.findOne({
        where: { email, purpose },
        lock: { mode: 'pessimistic_write' },
      });
      const now = new Date();

      if (!verification) {
        return this.badRequestResult('인증번호를 먼저 요청해주세요');
      }

      if (verification.verifiedAt !== null) {
        return this.badRequestResult('이미 인증이 완료된 이메일입니다');
      }

      if (verification.codeExpiresAt.getTime() <= now.getTime()) {
        return this.badRequestResult('인증번호가 만료되었습니다');
      }

      if (verification.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return this.tooManyAttemptsResult();
      }

      if (!this.isCodeMatching(verification, code)) {
        verification.failedAttempts += 1;
        await repository.save(verification);

        if (verification.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          return this.tooManyAttemptsResult();
        }

        return this.badRequestResult('인증번호가 올바르지 않습니다', {
          remainingAttempts: MAX_FAILED_ATTEMPTS - verification.failedAttempts,
        });
      }

      const verificationToken = randomBytes(32).toString('base64url');

      verification.verifiedAt = now;
      verification.verificationTokenHash =
        this.hashVerificationToken(verificationToken);
      verification.verificationTokenExpiresAt = new Date(
        now.getTime() + VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000,
      );
      await repository.save(verification);

      return {
        kind: 'success',
        verificationToken,
      } satisfies VerifyTransactionResult;
    });

    if (result.kind === 'bad-request') {
      throw new BadRequestException(result.reason, 'BAD_REQUEST', result.data);
    }

    if (result.kind === 'too-many-requests') {
      throw new TooManyRequestsException(
        result.reason,
        'TOO_MANY_REQUESTS',
        result.data,
      );
    }

    return {
      verificationToken: result.verificationToken,
      expiresInSeconds: VERIFICATION_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async consumeSignupVerification(
    email: string,
    token: string,
    manager: EntityManager,
  ): Promise<void> {
    await this.consumeVerification(
      email,
      token,
      EmailVerificationPurpose.SIGNUP,
      '이메일 인증 정보가 유효하지 않습니다',
      manager,
    );
  }

  async consumePasswordResetVerification(
    email: string,
    token: string,
    manager: EntityManager,
  ): Promise<void> {
    await this.consumeVerification(
      email,
      token,
      EmailVerificationPurpose.PASSWORD_RESET,
      '비밀번호 재설정 정보가 유효하지 않습니다.',
      manager,
    );
  }

  private async consumeVerification(
    email: string,
    token: string,
    purpose: EmailVerificationPurpose,
    invalidReason: string,
    manager: EntityManager,
  ): Promise<void> {
    const repository = manager.getRepository(EmailVerificationEntity);
    const verification = await repository.findOne({
      where: { email, purpose },
      lock: { mode: 'pessimistic_write' },
    });
    const now = new Date();

    if (
      !verification ||
      verification.verifiedAt === null ||
      verification.verificationTokenHash === null ||
      verification.verificationTokenExpiresAt === null ||
      verification.verificationTokenExpiresAt.getTime() <= now.getTime() ||
      verification.consumedAt !== null ||
      !this.isVerificationTokenMatching(
        verification.verificationTokenHash,
        token,
      )
    ) {
      throw new BadRequestException(invalidReason);
    }

    verification.consumedAt = now;
    await repository.save(verification);
  }

  private createSendVerificationResult(): SendVerificationResult {
    return {
      expiresInSeconds: CODE_EXPIRES_IN_SECONDS,
      resendAvailableInSeconds: RESEND_COOLDOWN_SECONDS,
    };
  }

  private async deliverVerificationCode(
    issuedVerification: IssuedVerification,
    send: () => Promise<void>,
  ): Promise<void> {
    try {
      await send();
    } catch {
      await this.emailVerificationRepository.update(
        {
          emailVerificationId: issuedVerification.emailVerificationId,
          codeHash: issuedVerification.codeHash,
        },
        {
          codeExpiresAt: new Date(),
          sentAt: new Date(0),
        },
      );
      throw new InternalServerException();
    }
  }

  private async issueVerification(
    email: string,
    purpose: EmailVerificationPurpose,
  ): Promise<IssuedVerification> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(EmailVerificationEntity);
        const existingVerification = await repository.findOne({
          where: { email, purpose },
          lock: { mode: 'pessimistic_write' },
        });
        const now = new Date();

        if (existingVerification) {
          const retryAfterSeconds = this.getRetryAfterSeconds(
            existingVerification.sentAt,
            now,
          );

          if (retryAfterSeconds > 0) {
            throw this.createCooldownException(retryAfterSeconds);
          }

          if (
            this.hasValidUnconsumedVerificationToken(existingVerification, now)
          ) {
            throw new BadRequestException('이미 인증이 완료된 이메일입니다');
          }
        }

        const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
        const codeHash = this.hashCode(email, purpose, code);
        const verification =
          existingVerification ??
          repository.create({
            email,
            purpose,
          });

        Object.assign(verification, {
          codeHash,
          codeExpiresAt: new Date(
            now.getTime() + CODE_EXPIRES_IN_SECONDS * 1000,
          ),
          failedAttempts: 0,
          sentAt: now,
          verifiedAt: null,
          verificationTokenHash: null,
          verificationTokenExpiresAt: null,
          consumedAt: null,
        });

        const savedVerification = await repository.save(verification);

        return {
          emailVerificationId: savedVerification.emailVerificationId,
          code,
          codeHash,
        };
      });
    } catch (error) {
      if (error instanceof TooManyRequestsException) {
        throw error;
      }

      if (this.isUniqueConstraintViolation(error)) {
        throw this.createCooldownException(RESEND_COOLDOWN_SECONDS);
      }

      throw error;
    }
  }

  private getRetryAfterSeconds(sentAt: Date, now: Date): number {
    const remainingMilliseconds =
      sentAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - now.getTime();

    return Math.max(0, Math.ceil(remainingMilliseconds / 1000));
  }

  private hasValidUnconsumedVerificationToken(
    verification: EmailVerificationEntity,
    now: Date,
  ): boolean {
    return (
      verification.verifiedAt !== null &&
      verification.verificationTokenHash !== null &&
      verification.verificationTokenExpiresAt !== null &&
      verification.verificationTokenExpiresAt.getTime() > now.getTime() &&
      verification.consumedAt === null
    );
  }

  private badRequestResult(
    reason: string,
    data: unknown = null,
  ): VerifyTransactionResult {
    return { kind: 'bad-request', reason, data };
  }

  private tooManyAttemptsResult(): VerifyTransactionResult {
    return {
      kind: 'too-many-requests',
      reason: '인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요',
      data: null,
    };
  }

  private createCooldownException(
    retryAfterSeconds: number,
  ): TooManyRequestsException {
    return new TooManyRequestsException(
      '인증번호는 60초 후 다시 요청할 수 있습니다',
      'TOO_MANY_REQUESTS',
      { retryAfterSeconds },
    );
  }

  private hashCode(
    email: string,
    purpose: EmailVerificationPurpose,
    code: string,
  ): string {
    return createHmac('sha256', this.verificationSecret)
      .update(`${purpose}:${email}:${code}`)
      .digest('hex');
  }

  private isCodeMatching(
    verification: EmailVerificationEntity,
    code: string,
  ): boolean {
    const storedHash = Buffer.from(verification.codeHash, 'hex');
    const submittedHash = Buffer.from(
      this.hashCode(verification.email, verification.purpose, code),
      'hex',
    );

    return (
      storedHash.length === submittedHash.length &&
      timingSafeEqual(storedHash, submittedHash)
    );
  }

  private hashVerificationToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private isVerificationTokenMatching(
    storedTokenHash: string,
    token: string,
  ): boolean {
    const storedHash = Buffer.from(storedTokenHash, 'hex');
    const submittedHash = Buffer.from(this.hashVerificationToken(token), 'hex');

    return (
      storedHash.length === submittedHash.length &&
      timingSafeEqual(storedHash, submittedHash)
    );
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
