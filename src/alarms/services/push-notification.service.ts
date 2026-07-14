import { Inject, Injectable } from "@nestjs/common";
import { FIREBASE_ADMIN } from "../firebase-admin.provider";
import type { App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

@Injectable()
export class PushNotificationService {
    constructor(
        @Inject(FIREBASE_ADMIN) private readonly firebaseApp: App,
    ) {}

    async sendDiaryReminderPush(fcmToken: string) {
        return await getMessaging(this.firebaseApp).send({
            token: fcmToken,
            notification: {
                title: '일기 작성 알림',
                body: '오늘 일기를 작성해보세요!'
            }
        });
    }

    async sendDiaryReplyPush(fcmToken: string) {
        return await getMessaging(this.firebaseApp).send({
            token: fcmToken,
            notification: {
                title: '일기 답장 알림',
                body: 'AI가 일기에 답장을 남겼어요!'
            }
        });
    }
}