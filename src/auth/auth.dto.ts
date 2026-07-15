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

export class CheckSignupEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SendSignupEmailVerificationDto extends CheckSignupEmailDto {}

export class VerifySignupEmailDto extends CheckSignupEmailDto {
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
  marketingAgreed?: boolean | null;
}
