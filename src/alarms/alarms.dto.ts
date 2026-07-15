import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { DeviceType } from "./entities/push-token.entity";


// 알람 설정 조회 응답 DTO
export class AlarmResponseDto {
    alarmId: number;
    // PUSH 알람 여부 
    isPush: boolean;  
    // 일기 작성 알람 여부
    isDiary: boolean;
    // 일기 답장 알람 여부
    isDiaryReply: boolean;
}

// 리마인드 조회 응답 DTO
export class ReminderResponseDto {
    // 리마인드 ID
    reminderId: number;
    // 알람 요일
    days: string[] | null;
    // 알람 시간
    time: string | null;
}

// 알람 설정 수정 DTO
export class UpdateAlarmDto {
    //PUSH 알람 여부 
    @IsOptional()
    @Transform(({ value }) => value === true ||value === 'true')
    @IsBoolean()
    isPush?: boolean;

    // 일기 작성 알람 여부
    @IsOptional()
    @Transform(({ value }) => value === true ||value === 'true')
    @IsBoolean()
    isDiary?: boolean;

    // 일기 답장 알람 여부
    @IsOptional()
    @Transform(({ value }) => value === true ||value === 'true')
    @IsBoolean()
    isDiaryReply?: boolean;
}

// 리마인드 설정 수정 DTO
export class UpdateReminderDto {
    // 알람 요일
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    days?: string[] | null;

    // 알람 시간
    @IsOptional()
    @IsString()
    time?: string | null;
}

// FCM 토큰 요청 
export class PushTokenRequestDto {
    @IsString()
    fcmToken: string;

    @IsEnum(DeviceType)
    deviceType: DeviceType;
}
// FCM 토큰 응답
export class PushTokenResponseDto {
    tokenId: number;
    fcmToken: string;
    deviceType: DeviceType;
}