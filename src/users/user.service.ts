import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

type CreateUserParams = {
  email: string;
  password: string;
  name: string;
  profileImageUrl: string | null;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
}
