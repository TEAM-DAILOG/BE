import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReminderEntity } from '../entities/reminder.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { PushNotificationService } from './push-notification.service';
import { Cron } from '@nestjs/schedule';
import { DiaryEntity } from '@/src/diaries/entities/diary.entity';
import { PushTokenEntity } from '../entities/push-token.entity';
import { UserAlarmEntity } from '../entities/user-alarm.entity';

@Injectable()
export class AlarmNotificationService {
  constructor(
    @InjectRepository(ReminderEntity)
    private readonly reminderRepository: Repository<ReminderEntity>,
    @InjectRepository(DiaryEntity)
    private readonly diaryRepository: Repository<DiaryEntity>,
    @InjectRepository(PushTokenEntity)
    private readonly pushTokenRepository: Repository<PushTokenEntity>,
    @InjectRepository(UserAlarmEntity)
    private readonly userAlarmRepository: Repository<UserAlarmEntity>,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Cron('0 * * * * *') // 매 분 실행할수 있게 설정
  // 리마인드 알람 스케줄러
  async handleDiaryReminder() {
    const now = new Date();
    const currentDay = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][
      now.getDay()
    ];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const reminders = await this.reminderRepository.find({
      where: { userAlarm: { isPush: true, isDiary: true } },
      relations: ['userAlarm', 'userAlarm.user', 'userAlarm.user.pushTokens'],
    });

    for (const reminder of reminders) {
      // 사용자가 현재 요일 및 시간에 포함되어 있는지 확인
      if (!reminder.days?.includes(currentDay)) continue;
      if (reminder.time != currentTime) continue;

      // 일기 작성 여부 확인
      const userId = reminder.userAlarm.user.userId;
      const todayStart = new Date();
      // 금일 00:00:00 이후로 일기를 작성했는지를 체크 -> 없으면 알람 전송
      todayStart.setHours(0, 0, 0, 0);

      const hasDiary = await this.diaryRepository.findOne({
        where: { userId, createdAt: MoreThanOrEqual(todayStart) },
      });
      if (hasDiary) continue;

      for (const token of reminder.userAlarm.user.pushTokens) {
        await this.pushNotificationService.sendDiaryReminderPush(
          token.fcmToken,
        );
      }
    }
  }

  async notifyDiaryReply(userId: number) {
    const userAlarm = await this.userAlarmRepository.findOne({
      where: { user: { userId } },
    });

    if (!userAlarm?.isPush || !userAlarm?.isDiaryReply) return;

    const pushTokens = await this.pushTokenRepository.find({
      where: { user: { userId } },
    });

    for (const token of pushTokens) {
      await this.pushNotificationService.sendDiaryReplyPush(token.fcmToken);
    }
  }
}
