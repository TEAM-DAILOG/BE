import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserAgreementEntity } from './entities/user-agreement.entity';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { S3Module } from '../global/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserAgreementEntity,
      RefreshTokenEntity,
    ]),
    S3Module,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
