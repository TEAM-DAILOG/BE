import {
  IsBoolean,
  IsEmail,
  IsEnum,
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

export class CheckSignupEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
