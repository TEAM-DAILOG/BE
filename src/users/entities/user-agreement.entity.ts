import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseModel } from '@/src/global/base-model';

export enum AgreementType {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
}

@Entity('UserAgreement')
export class UserAgreementEntity extends BaseModel {
  @PrimaryGeneratedColumn({ name: 'user_agreement_id', type: 'int' })
  userAgreementId: number;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'agreement_type',
    type: 'enum',
    enum: AgreementType,
    enumName: 'agreement_type_enum',
    nullable: false,
    comment: '약관 종류',
  })
  agreementType: AgreementType;

  @Column({
    name: 'agreement_version',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '약관 버전',
  })
  agreementVersion: string;

  @Column({
    name: 'is_agreed',
    type: 'boolean',
    nullable: false,
    comment: '동의 여부',
  })
  isAgreed: boolean;

  @Column({
    name: 'agreed_at',
    type: 'timestamp',
    nullable: true,
    comment: '동의일',
  })
  agreedAt: Date | null;

  @Column({
    name: 'revoked_at',
    type: 'timestamp',
    nullable: true,
    comment: '철회일',
  })
  revokedAt: Date | null;

}
