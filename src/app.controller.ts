import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      data: '서버 실행 확인 성공'
    };
  }
}
