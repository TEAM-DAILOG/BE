import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./users.dto";
import { GetMyProfileSwagger, UpdateMyProfileSwagger } from "./users.swagger";

@ApiTags('users')
@Controller('users')
export class UsersController {
    
    constructor(
        private readonly userService: UserService
    ) {}

    // 사용자 정보 조회
    @GetMyProfileSwagger()
    @Get('/me')
    async getMyProfile() {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        const data = await this.userService.findOneUserEntity(userId);
        return { message: '사용자 정보 조회 성공', data };
    }

    // 사용자 정보 수정
    @UpdateMyProfileSwagger()
    @Patch('/me')
    async userUpdate(
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const userId = 1; //나중에 사용자 인증 데코레이터로 교체
        const data = await this.userService.updateUserEntity(userId, updateUserDto);
        
        return { message: '사용자 정보 수정 성공', data };
    }
}