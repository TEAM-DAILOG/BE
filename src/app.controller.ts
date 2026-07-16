import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class AppController {
  @Get()
  getHealth() {
    return {
      message: '서버 실행 확인 성공',
    };
  }
}
