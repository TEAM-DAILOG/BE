import {
  IsBoolean,
  IsEmail,
  IsEnum,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeviceType } from '../users/entities/refresh-token.entity';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  deviceId?: string | null;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType | null;
}

export class ReissueAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CheckSignupEmailDto extends EmailDto {}

export class SendSignupEmailVerificationDto extends EmailDto {}

export class SendPasswordResetEmailVerificationDto extends EmailDto {}

export class VerifyPasswordResetEmailDto extends EmailDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}

export class ResetPasswordDto extends EmailDto {
  @IsString()
  @IsNotEmpty()
  passwordResetToken: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class VerifySignupEmailDto extends EmailDto {
  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  emailVerificationToken: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string | null;

  @IsBoolean()
  termsOfServiceAgreed: boolean;

  @IsBoolean()
  privacyPolicyAgreed: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotificationAgreed?: boolean | null;
}
