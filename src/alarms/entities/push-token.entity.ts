import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum DeviceType {
    IOS = 'IOS', // 애플
    ANDROID = "ANDROID" // 안드로이드
}

// 푸시 알람
@Entity('PushToken')
export class PushTokenEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    tokenId: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'FCM 디바이스 토큰'
    })
    fcmToken: string;

    @Column({
        type: 'enum',
        enum: DeviceType,
        nullable:false,
        comment: '디바이스 종류'
    })
    deviceType: DeviceType;

    @CreateDateColumn({
        type: 'timestamp',
        nullable: false,
        comment: '생성일'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        comment: '수정일',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        comment: '삭제일',
    })
    deletedAt: Date;
}