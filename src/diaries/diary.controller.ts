import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

import { DiaryService } from './diary.service';
import { CreateDiaryDto, UpdateDiaryDto } from './diary.dto';
import {
  CreateDiarySwagger,
  DeleteDiarySwagger,
  FindAllDiarySwagger,
  FindDiarySwagger,
  UpdateDiarySwagger,
} from './diary.swagger';

import { S3Service } from '../global/s3/s3.service';
import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';

@ApiTags('Diary')
@Controller('diaries')
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 일기 목록 조회
   */
  @AccessTokenAuth()
  @FindAllDiarySwagger()
  @Get()
  async findAllDiary(
    @CurrentUserId() userId: number,
  ) {
    const diaries = await this.diaryService.findAllDiary(userId);

    return {
      message: '일기 목록 조회 성공',
      data: diaries,
    };
  }

  /**
   * 일기 상세 조회
   */
  @AccessTokenAuth()
  @FindDiarySwagger()
  @Get(':diaryId')
  async findDiary(
    @CurrentUserId() userId: number,
    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    const diary = await this.diaryService.findDiaryDetail(
      diaryId,
      userId,
    );

    return {
      message: '일기 상세 조회 성공',
      data: diary,
    };
  }

  /**
   * 일기 작성 (이미지 업로드 포함)
   */
  @AccessTokenAuth()
  @CreateDiarySwagger()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 3))
  @Post()
  async createDiary(
    @CurrentUserId() userId: number,

    @UploadedFiles()
    files: Express.Multer.File[],

    @Body()
    dto: CreateDiaryDto,
  ) {
    const imageUrls =
  files && files.length > 0
    ? await this.s3Service.uploadDiaryImages(files)
    : [];

dto.images = imageUrls;

    dto.images = imageUrls;

    const diary = await this.diaryService.createDiary(userId, dto);

    return {
      message: '일기 작성 성공',
      data: diary,
    };
  }

  /**
   * 일기 수정
   */
  @AccessTokenAuth()
  @UpdateDiarySwagger()
  @Patch(':diaryId')
  async updateDiary(
    @CurrentUserId() userId: number,

    @Param('diaryId', ParseIntPipe)
    diaryId: number,

    @Body()
    dto: UpdateDiaryDto,
  ) {
    const diary = await this.diaryService.updateDiary(
      diaryId,
      userId,
      dto,
    );

    return {
      message: '일기 수정 성공',
      data: diary,
    };
  }

  /**
   * 일기 삭제
   */
  @AccessTokenAuth()
  @DeleteDiarySwagger()
  @Delete(':diaryId')
  async deleteDiary(
    @CurrentUserId() userId: number,

    @Param('diaryId', ParseIntPipe)
    diaryId: number,
  ) {
    const result = await this.diaryService.deleteDiary(
      diaryId,
      userId,
    );

    return {
      message: '일기 삭제 성공',
      data: result,
    };
  }
}