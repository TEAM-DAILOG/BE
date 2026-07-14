import { Inject, Injectable, Logger } from "@nestjs/common";
import { FIREBASE_ADMIN } from "../firebase-admin.provider";
import type { App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

@Injectable()
export class PushNotificationService {

    private readonly logger = new Logger(PushNotificationService.name);

    constructor(
        @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
    ) {}

    async sendDiaryReminderPush(fcmToken: string): Promise<boolean> {
        try {
            await getMessaging(this.firebaseApp).send({
                token: fcmToken,
                notification: {
                    title: '일기 작성 알림',
                    body: '오늘 일기를 작성해보세요!'
                }
            });
            return true;
        } catch (error){
            this.logger.error(`일기 작성 알림 전송 실패 - token: ${fcmToken}`, error);
            return false;
        }
    }

    async sendDiaryReplyPush(fcmToken: string): Promise<boolean> {
        try {
            await getMessaging(this.firebaseApp).send({
                token: fcmToken,
                notification: {
                    title: '일기 답장 알림',
                    body: 'AI가 일기에 답장을 남겼어요!'
                }
            });
            return true;
        } catch (error) {
            this.logger.error(`일기 답장 알림 전송 실패 - token: ${fcmToken}`, error);
            return false;
        }
    }
}