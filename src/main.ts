import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './global/error/error.filter';
import { ResponseInterceptor } from './global/common/response.interceptor';

async function bootstrap() {
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
    origin: [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://dailog.kro.kr',
      'https://dailog.kro.kr',
    ],
  });

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access Token을 입력하세요.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(Number(process.env.BACKEND_PORT) || 3000);
}
bootstrap();
