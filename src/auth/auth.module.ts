import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsModule } from '../alarms/alarms.module';
import { CategoryModule } from '../categories/category.module';
import { MailModule } from '../global/mail/mail.module';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { S3Module } from '../global/s3/s3.module';

@Module({
  imports: [
    UserModule,
    AlarmsModule,
    CategoryModule,
    PassportModule,
    JwtModule,
    TypeOrmModule.forFeature([EmailVerificationEntity]),
    MailModule,
    S3Module,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
