import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.getOrThrow<string>('SMTP_FROM');
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: this.configService.getOrThrow<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendSignupVerificationCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: '[Dailog] 이메일 인증번호를 안내드립니다.',
      text: [
        'Dailog 회원가입 이메일 인증번호입니다.',
        '',
        code,
        '',
        '인증번호는 5분 동안 유효합니다.',
      ].join('\n'),
    });
  }
}
