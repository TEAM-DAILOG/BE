import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum DeviceType {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

@Entity('RefreshToken')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn({ name: 'refresh_token_id', type: 'int' })
  refreshTokenId: number;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '리프레시 토큰 해시값',
  })
  tokenHash: string;

  @Column({
    name: 'device_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '디바이스 식별자',
  })
  deviceId: string | null;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
    nullable: true,
    comment: '디바이스 종류',
  })
  deviceType: DeviceType | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: false,
    comment: '만료일',
  })
  expiresAt: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamp',
    nullable: true,
    comment: '폐기일',
  })
  revokedAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    comment: '생성일',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    comment: '수정일',
  })
  updatedAt: Date | null;
}
