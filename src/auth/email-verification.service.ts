import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomInt } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import {
  InternalServerException,
  TooManyRequestsException,
} from '../global/error/custom.exception';
import { MailService } from '../global/mail/mail.service';
import {
  EmailVerificationEntity,
  EmailVerificationPurpose,
} from './entities/email-verification.entity';

const CODE_EXPIRES_IN_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export interface SendVerificationResult {
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

interface IssuedVerification {
  emailVerificationId: number;
  code: string;
  codeHash: string;
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
    const issuedVerification = await this.issueSignupVerification(email);

    try {
      await this.mailService.sendSignupVerificationCode(
        email,
        issuedVerification.code,
      );
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

    return {
      expiresInSeconds: CODE_EXPIRES_IN_SECONDS,
      resendAvailableInSeconds: RESEND_COOLDOWN_SECONDS,
    };
  }

  private async issueSignupVerification(
    email: string,
  ): Promise<IssuedVerification> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(EmailVerificationEntity);
        const existingVerification = await repository.findOne({
          where: {
            email,
            purpose: EmailVerificationPurpose.SIGNUP,
          },
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
        }

        const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
        const codeHash = this.hashCode(
          email,
          EmailVerificationPurpose.SIGNUP,
          code,
        );
        const verification =
          existingVerification ??
          repository.create({
            email,
            purpose: EmailVerificationPurpose.SIGNUP,
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

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
