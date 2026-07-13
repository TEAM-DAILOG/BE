import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AlarmsModule } from './alarms/alarms.module';
import { ScheduleModule } from './schedules/schedule.module';
import { UserModule } from './users/user.module';
import { DiariesModule } from './diaries/diary.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        namingStrategy: new SnakeNamingStrategy(), // DB 컬럼명 자동으로 Snakecase로 변환

        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: true,
      }),
    }),
    AlarmsModule,
    ScheduleModule,
    UserModule,
    DiariesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
