import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      resultType: 'SUCCESS',
      message: '성공',
      data: '백엔드 화이팅!!!!!!!!!',
    };
  }
}
