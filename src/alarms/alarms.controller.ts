import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AlarmService } from './services/alarms.service';
import {
  PushTokenRequestDto,
  UpdateAlarmDto,
  UpdateReminderDto,
} from './alarms.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  DeletePushTokenSwagger,
  FindOneAlarmSwagger,
  FindOneReminderSwagger,
  RegisterPushTokenSwagger,
  UpdateAlarmSwagger,
  UpdateReminderSwagger,
} from './alarms.swagger';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';

@ApiTags('alarms')
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  // 알람 설정 조회
  @FindOneAlarmSwagger()
  @AccessTokenAuth()
  @Get()
  async alarmAll(@CurrentUserId() userId: number) {
    const data = await this.alarmService.findOneAlarmEntity(userId);
    return { message: '알림 설정 조회 성공', data };
  }

  // 알람 설정 수정
  @UpdateAlarmSwagger()
  @AccessTokenAuth()
  @Patch()
  async alarmUpdate(
    @Body() updateAlarmDto: UpdateAlarmDto,
    @CurrentUserId() userId: number,
  ) {
    const data = await this.alarmService.updateAlarmEntity(
      userId,
      updateAlarmDto,
    );
    return { message: '알림 설정 수정 성공', data };
  }

  // 리마인드 알람 설정 조회
  @FindOneReminderSwagger()
  @AccessTokenAuth()
  @Get('/reminder')
  async reminderAll(@CurrentUserId() userId: number) {
    const data = await this.alarmService.findOneReminderEntity(userId);
    return { message: '리마인드 알림 설정 조회 성공', data };
  }

  // 리마인드 알람 설정 수정
  @UpdateReminderSwagger()
  @AccessTokenAuth()
  @Patch('/reminder')
  async reminderUpdate(
    @Body() updateReminderDto: UpdateReminderDto,
    @CurrentUserId() userId: number,
  ) {
    const data = await this.alarmService.updateReminderEntity(
      userId,
      updateReminderDto,
    );
    return { message: '리마인드 알림 설정 수정 성공', data };
  }

  // FCM 토큰 등록 (앱 로그인/실행 시)
  @RegisterPushTokenSwagger()
  @AccessTokenAuth()
  @Post('/push-token')
  async registerPushToken(
    @Body() pushTokenRequestDto: PushTokenRequestDto,
    @CurrentUserId() userId: number,
  ) {
    const data = await this.alarmService.registerPushToken(
      userId,
      pushTokenRequestDto,
    );
    return { message: 'FCM 토큰 등록 성공', data };
  }

  // FCM 토큰 삭제 (앱 로그아웃 시)
  @DeletePushTokenSwagger()
  @AccessTokenAuth()
  @Delete('/push-token/:tokenId')
  async deletePushToken(
    @Param('tokenId') tokenId: number,
    @CurrentUserId() userId: number,
  ) {
    await this.alarmService.deletePushToken(userId, tokenId);
    return { message: 'FCM 토큰 삭제 성공', data: null };
  }
}
