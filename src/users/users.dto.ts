import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

// 사용자 정보 조회 응답 DTO
export class UserResponseDto {
  userId: number;
  email: string | null;
  name: string;
  profileImageUrl: string | null;
}

// 사용자 정보 수정 DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  profileImageUrl?: string | null;
}

// AI 일기 요약 ON/OFF 요청 DTO
export class UpdateAiSummaryDto {
  @IsBoolean()
  isAiSummary: boolean;
}

// AI 일기 요약 ON/OFF 응답 DTO
export class AiSummaryResponseDto {
  isAiSummary: boolean;
}
