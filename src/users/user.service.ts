import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AgreementType,
  UserAgreementEntity,
} from './entities/user-agreement.entity';
import { UserEntity } from './entities/user.entity';

const CURRENT_AGREEMENT_VERSION = '1.0';

type CreateUserParams = {
  email: string;
  password: string;
  name: string;
  profileImageUrl: string | null;
};

type CreateSignupAgreementsParams = {
  user: UserEntity;
  termsOfServiceAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed?: boolean | null;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserAgreementEntity)
    private readonly userAgreementRepository: Repository<UserAgreementEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  async createUser({
    email,
    password,
    name,
    profileImageUrl,
  }: CreateUserParams): Promise<UserEntity> {
    const user = this.userRepository.create({
      email,
      password,
      name,
      profileImageUrl,
      isAiSummary: false,
    });

    return this.userRepository.save(user);
  }

  async createSignupAgreements({
    user,
    termsOfServiceAgreed,
    privacyPolicyAgreed,
    marketingAgreed,
  }: CreateSignupAgreementsParams): Promise<UserAgreementEntity[]> {
    const now = new Date();
    const isMarketingAgreed = marketingAgreed === true;
    const agreements = this.userAgreementRepository.create([
      this.createAgreement({
        user,
        agreementType: AgreementType.TERMS_OF_SERVICE,
        isAgreed: termsOfServiceAgreed,
        now,
      }),
      this.createAgreement({
        user,
        agreementType: AgreementType.PRIVACY_POLICY,
        isAgreed: privacyPolicyAgreed,
        now,
      }),
      this.createAgreement({
        user,
        agreementType: AgreementType.MARKETING,
        isAgreed: isMarketingAgreed,
        now,
      }),
    ]);

    return this.userAgreementRepository.save(agreements);
  }

  private createAgreement({
    user,
    agreementType,
    isAgreed,
    now,
  }: {
    user: UserEntity;
    agreementType: AgreementType;
    isAgreed: boolean;
    now: Date;
  }): Partial<UserAgreementEntity> {
    return {
      user,
      agreementType,
      agreementVersion: CURRENT_AGREEMENT_VERSION,
      isAgreed,
      agreedAt: isAgreed ? now : null,
      revokedAt: null,
    };
  }
}
