import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAgreementEntity } from './entities/user-agreement.entity';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserAgreementEntity])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
