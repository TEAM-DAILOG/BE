import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserAgreementEntity } from './entities/user-agreement.entity';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserAgreementEntity,
      RefreshTokenEntity,
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
