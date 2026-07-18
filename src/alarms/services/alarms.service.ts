import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PushTokenEntity } from '../entities/push-token.entity';
import { ReminderEntity } from '../entities/reminder.entity';
import { UserAlarmEntity } from '../entities/user-alarm.entity';
import { EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '../../global/error/custom.exception';
import {
  AlarmResponseDto,
  PushTokenRequestDto,
  PushTokenResponseDto,
  ReminderResponseDto,
  UpdateAlarmDto,
  UpdateReminderDto,
} from '../alarms.dto';
import { UserEntity } from '@/src/users/entities/user.entity';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(PushTokenEntity)
    private readonly pushTokenRepository: Repository<PushTokenEntity>,

    @InjectRepository(UserAlarmEntity)
    private readonly userAlarmRepository: Repository<UserAlarmEntity>,

    @InjectRepository(ReminderEntity)
    private readonly reminderRepository: Repository<ReminderEntity>,
  ) {}

  async createDefaultAlarm(
    user: UserEntity,
    isPush: boolean,
    manager?: EntityManager,
  ): Promise<UserAlarmEntity> {
    const userAlarmRepository =
      manager?.getRepository(UserAlarmEntity) ?? this.userAlarmRepository;
    const userAlarm = userAlarmRepository.create({
      user,
      isPush,
      isDiary: false,
      isDiaryReply: false,
    });

    return userAlarmRepository.save(userAlarm);
  }

  // 사용자 정보 포함 내부 단건 알람 조회
  async findOneAlarmEntity(userId: number): Promise<AlarmResponseDto> {
    const { alarmId, isPush, isDiary, isDiaryReply } =
      await this.findAlarmByUserId(userId);
    return { alarmId, isPush, isDiary, isDiaryReply };
  }

  // 컨트롤러에서 호출하는 리마인드 조회용 API
  async findOneReminderEntity(userId: number): Promise<ReminderResponseDto> {
    const { reminderId, days, time } = await this.findReminderByUserId(userId);
    return { reminderId, days, time };
  }

  // DB에서 원본 그대로 반환, 내부에서만 사용
  private async findReminderByUserId(userId: number): Promise<ReminderEntity> {
    const foundReminder = await this.reminderRepository.findOne({
      where: { userAlarm: { user: { userId } } },
    });
    if (!foundReminder)
      throw new NotFoundException('해당 리마인드를 찾을 수 없습니다.');
    return foundReminder;
  }

  // 내부용 알람 조회
  private async findAlarmByUserId(userId: number): Promise<UserAlarmEntity> {
    const foundAlarm = await this.userAlarmRepository.findOne({
      where: { user: { userId } },
    });
    if (!foundAlarm)
      throw new NotFoundException('해당 사용자 알람을 찾을 수 없습니다.');
    return foundAlarm;
  }

  // 리마인드 수정
  async updateReminderEntity(
    userId: number,
    updateReminderDto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    const foundReminder = await this.findReminderByUserId(userId);
    // 변경값 적용
    Object.assign(foundReminder, updateReminderDto);
    const saved = await this.reminderRepository.save(foundReminder);
    const { reminderId, days, time } = saved;
    return { reminderId, days, time };
  }

  // 알람 수정
  async updateAlarmEntity(
    userId: number,
    updateAlarmDto: UpdateAlarmDto,
  ): Promise<AlarmResponseDto> {
    const foundAlarm = await this.findAlarmByUserId(userId);

    // isPush가 false로 변경시 나머지 알람도 OFF
    if (updateAlarmDto.isPush === false) {
      updateAlarmDto.isDiary = false;
      updateAlarmDto.isDiaryReply = false;
    }

    // 변경값 적용
    Object.assign(foundAlarm, updateAlarmDto);
    const saved = await this.userAlarmRepository.save(foundAlarm);
    const { alarmId, isPush, isDiary, isDiaryReply } = saved;
    return { alarmId, isPush, isDiary, isDiaryReply };
  }

  // 토큰 저장
  async registerPushToken(
    userId: number,
    pushTokenRequestDto: PushTokenRequestDto,
  ): Promise<PushTokenResponseDto> {
    if (!userId) throw new NotFoundException('해당 사용자를 찾을 수 없습니다!');
    const { fcmToken, deviceType } = pushTokenRequestDto;

    // 기존 토큰 확인
    const existingToken = await this.pushTokenRepository.findOne({
      where: { user: { userId }, deviceType },
    });

    if (existingToken) {
      existingToken.fcmToken = fcmToken;
      const saved = await this.pushTokenRepository.save(existingToken);
      const { tokenId, fcmToken: token, deviceType: type } = saved;
      return { tokenId, fcmToken: token, deviceType: type };
    }

    // 신규 토큰 생성
    const newToken = this.pushTokenRepository.create({
      user: { userId },
      fcmToken,
      deviceType,
    });

    const saved = await this.pushTokenRepository.save(newToken);
    const { tokenId, fcmToken: token, deviceType: type } = saved;
    return { tokenId, fcmToken: token, deviceType: type };
  }

  // 토큰 삭제
  async deletePushToken(userId: number, tokenId: number) {
    // 기존 토큰 확인
    const existingToken = await this.pushTokenRepository.findOne({
      where: { tokenId, user: { userId } },
    });

    if (!existingToken) {
      throw new NotFoundException('해당 토큰을 찾을 수 없습니다.');
    }

    return await this.pushTokenRepository.softDelete(tokenId);
  }
}
