import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AlarmService } from "./services/alarms.service";
import { PushTokenRequestDto, UpdateAlarmDto, UpdateReminderDto } from "./alarms.dto";
import { ApiTags } from "@nestjs/swagger";
import { DeletePushTokenSwagger, FindOneAlarmSwagger, FindOneReminderSwagger, RegisterPushTokenSwagger, UpdateAlarmSwagger, UpdateReminderSwagger } from "./alarms.swagger";

@ApiTags('alarms')
@Controller('alarms')
export class AlarmController {

    constructor(
        private readonly alarmService: AlarmService
    ) {}

    // 알람 설정 조회
    @FindOneAlarmSwagger()
    @Get()
    async alarmAll() {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.findOneAlarmEntity(userId);
    }

    // 알람 설정 수정
    @UpdateAlarmSwagger()
    @Patch()
    async alarmUpdate(
        @Body() updateAlarmDto: UpdateAlarmDto,
    ) {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.updateAlarmEntity(userId, updateAlarmDto);
    }

    // 리마인드 알람 설정 조회
    @FindOneReminderSwagger()
    @Get('/reminder')
    async reminderAll() {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.findOneReminderEntity(userId);
    }

    // 리마인드 알람 설정 수정
    @UpdateReminderSwagger()
    @Patch('/reminder')
    async reminderUpdate(
        @Body() updateReminderDto: UpdateReminderDto,
    ) {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.updateReminderEntity(userId, updateReminderDto);
    }

    // FCM 토큰 등록 (앱 로그인/실행 시)
    @RegisterPushTokenSwagger()
    @Post('/push-token')
    async registerPushToken(
        @Body() pushTokenRequestDto: PushTokenRequestDto,
    ) {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.registerPushToken(userId, pushTokenRequestDto);
    }

    // FCM 토큰 삭제 (앱 로그아웃 시)
    @DeletePushTokenSwagger()
    @Delete('/push-token/:tokenId')
    async deletePushToken(
        @Param('tokenId') tokenId: number,
    ) {
        const userId = 1 //나중에 사용자 인증 데코레이터로 교체
        return this.alarmService.deletePushToken(userId, tokenId);
    }
}