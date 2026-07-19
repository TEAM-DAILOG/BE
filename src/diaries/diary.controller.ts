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

import { UploadedFiles, UseInterceptors } from '@nestjs/common';

import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../global/s3/s3.service';



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
  @FindAllDiarySwagger()
  @Get()
  async findAllDiary() {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    const diaries = await this.diaryService.findAllDiary(userId);

    return {
      data: diaries,
    };
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
    const diary = await this.diaryService.findDiaryDetail(diaryId);

    return {
      data: diary,
    };
  }

  /**
   * 일기 작성
   */
  @CreateDiarySwagger()
  @Post()
  async createDiary(@Body() dto: CreateDiaryDto) {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    const diary = await this.diaryService.createDiary(userId, dto);

    return {
      data: diary,
    };
  }

  @ApiOperation({
    summary: '일기 이미지 업로드',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 3))
  async uploadImages(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    const imageUrls = await this.s3Service.uploadDiaryImages(files);

    return {
      data: {
        imageUrls,
      },
    };
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
    const diary = await this.diaryService.updateDiary(diaryId, dto);

    return {
      data: diary,
    };
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
    const result = await this.diaryService.deleteDiary(diaryId);

    return {
      data: result,
    };
  }
}