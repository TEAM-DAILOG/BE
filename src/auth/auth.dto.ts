import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
