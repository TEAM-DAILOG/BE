import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '../global/error/custom.exception';
import {
  DeviceType,
  RefreshTokenEntity,
} from './entities/refresh-token.entity';
import {
  AgreementType,
  UserAgreementEntity,
} from './entities/user-agreement.entity';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto, UserResponseDto } from './users.dto';

const CURRENT_AGREEMENT_VERSION = '1.0';
const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

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

type CreateRefreshTokenParams = {
  user: UserEntity;
  tokenHash: string;
  deviceId?: string | null;
  deviceType?: DeviceType | null;
  expiresAt: Date;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserAgreementEntity)
    private readonly userAgreementRepository: Repository<UserAgreementEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
  }

  async findActiveByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findActiveLocalByEmail(
    email: string,
    manager?: EntityManager,
  ): Promise<UserEntity | null> {
    const userRepository =
      manager?.getRepository(UserEntity) ?? this.userRepository;
    const user = await userRepository.findOne({ where: { email } });

    return typeof user?.password === 'string' && user.password.length > 0
      ? user
      : null;
  }

  async findActiveLocalById(
    userId: number,
    manager?: EntityManager,
  ): Promise<UserEntity | null> {
    const userRepository =
      manager?.getRepository(UserEntity) ?? this.userRepository;
    const user = await userRepository.findOne({ where: { userId } });

    return typeof user?.password === 'string' && user.password.length > 0
      ? user
      : null;
  }

  async updatePassword(
    user: UserEntity,
    passwordHash: string,
    credentialsChangedAt: Date,
    manager: EntityManager,
  ): Promise<UserEntity> {
    const userRepository = manager.getRepository(UserEntity);
    user.password = passwordHash;
    user.credentialsChangedAt = credentialsChangedAt;

    return userRepository.save(user);
  }

  async revokeAllRefreshTokens(
    userId: number,
    revokedAt: Date,
    manager: EntityManager,
  ): Promise<void> {
    const refreshTokenRepository = manager.getRepository(RefreshTokenEntity);
    await refreshTokenRepository.update(
      { user: { userId }, revokedAt: IsNull() },
      { revokedAt },
    );
  }

  async createUser(
    { email, password, name, profileImageUrl }: CreateUserParams,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const userRepository =
      manager?.getRepository(UserEntity) ?? this.userRepository;
    const user = userRepository.create({
      email,
      password,
      name,
      profileImageUrl,
      isAiSummary: false,
    });

    try {
      return await userRepository.save(user);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException('이미 가입된 이메일입니다');
      }

      throw error;
    }
  }

  async createSignupAgreements(
    {
      user,
      termsOfServiceAgreed,
      privacyPolicyAgreed,
      marketingAgreed,
    }: CreateSignupAgreementsParams,
    manager?: EntityManager,
  ): Promise<UserAgreementEntity[]> {
    const now = new Date();
    const isMarketingAgreed = marketingAgreed === true;
    const userAgreementRepository =
      manager?.getRepository(UserAgreementEntity) ??
      this.userAgreementRepository;
    const agreements = userAgreementRepository.create([
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

    return userAgreementRepository.save(agreements);
  }

  async createRefreshToken({
    user,
    tokenHash,
    deviceId = null,
    deviceType = null,
    expiresAt,
  }: CreateRefreshTokenParams): Promise<RefreshTokenEntity> {
    const refreshToken = this.refreshTokenRepository.create({
      user,
      tokenHash,
      deviceId,
      deviceType,
      expiresAt,
      revokedAt: null,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });
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

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === POSTGRES_UNIQUE_VIOLATION_CODE
    );
  }

  // 사용자 조회
  async findOneUserEntity(userId: number): Promise<UserResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: { userId },
    });
    if (!foundUser) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const { userId: id, email, name, profileImageUrl } = foundUser;
    return { userId: id, email, name, profileImageUrl };
  }

  // 사용자 정보 수정
  async updateUserEntity(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: { userId },
    });
    if (!foundUser) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    Object.assign(foundUser, updateUserDto);

    try {
      const saved = await this.userRepository.save(foundUser);
      const { userId: id, email, name, profileImageUrl } = saved;
      return { userId: id, email, name, profileImageUrl };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error))
        throw new BadRequestException('이미 사용 중인 이메일입니다.');
      throw error;
    }
  }
}
