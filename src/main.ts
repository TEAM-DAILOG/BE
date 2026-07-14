import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './global/error/error.filter';
import { ResponseInterceptor } from './global/common/response.interceptor';

async function bootstrap() {
  // const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET 값이 없습니다.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.set('trust proxy', 1);

  app.enableCors({
    origin: ['http://localhost:8000', 'http://localhost:3000'], //배포 URL 추후 설정
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const local = `http://localhost:${process.env.BACKEND_PORT}`;
  // const prod = ''; // 배포 URL 추후 설정

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .addServer(local)
    // .addServer(isProd ? prod : local)
    // .addServer(isProd ? local : prod)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  await app.listen(Number(process.env.BACKEND_PORT) || 3000);
}
bootstrap();
