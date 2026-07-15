import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DiaryService } from './diary.service';
import { CreateDiaryDto, UpdateDiaryDto } from './diary.dto';
import {
  CreateDiarySwagger,
  DeleteDiarySwagger,
  FindAllDiarySwagger,
  FindDiarySwagger,
  UpdateDiarySwagger,
} from './diary.swagger';

@ApiTags('Diary')
@Controller('diaries')
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
  ) {}

  /**
   * 일기 목록 조회
   */
  @FindAllDiarySwagger()
  @Get()
  async findAllDiary() {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    return this.diaryService.findAllDiary(userId);
  }

  /**
   * 일기 상세 조회
   */
  @FindDiarySwagger()
  @Get(':diaryId')
  async findDiary(
    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    return this.diaryService.findOneDiary(diaryId);
  }

  /**
   * 일기 작성
   */
  @CreateDiarySwagger()
  @Post()
  async createDiary(
    @Body() dto: CreateDiaryDto,
  ) {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    return this.diaryService.createDiary(
      userId,
      dto,
    );
  }

  /**
   * 일기 수정
   */
  @UpdateDiarySwagger()
  @Patch(':diaryId')
  async updateDiary(
    @Param('diaryId', ParseIntPipe)
    diaryId: number,

    @Body()
    dto: UpdateDiaryDto,
  ) {
    return this.diaryService.updateDiary(
      diaryId,
      dto,
    );
  }

  /**
   * 일기 삭제
   */
  @DeleteDiarySwagger()
  @Delete(':diaryId')
  async deleteDiary(
    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    return this.diaryService.deleteDiary(
      diaryId,
    );
  }
}