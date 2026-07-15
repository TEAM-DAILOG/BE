import { SoftDeleteModel } from '@/src/global/base-model';
import { UserEntity } from '@/src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DeviceType {
  IOS = 'IOS', // 애플
  ANDROID = 'ANDROID', // 안드로이드
}

@Entity('PushToken')
export class PushTokenEntity extends SoftDeleteModel {
  @PrimaryGeneratedColumn()
  tokenId: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'FCM 디바이스 토큰',
  })
  fcmToken: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    nullable: false,
    comment: '디바이스 종류',
  })
  deviceType: DeviceType;

  @ManyToOne(() => UserEntity, (user) => user.pushTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
