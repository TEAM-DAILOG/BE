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

import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  ReorderCategoryDto,
  UpdateCategoryDto,
} from './category.dto';

import {
  CreateCategorySwagger,
  DeleteCategorySwagger,
  FindAllCategorySwagger,
  ReorderCategorySwagger,
  UpdateCategorySwagger,
} from './category.swagger';

import { AccessTokenAuth, CurrentUserId } from '../auth/auth.decorator';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 카테고리 목록 조회
   */
  @AccessTokenAuth()
  @FindAllCategorySwagger()
  @Get()
  async findAllCategory(@CurrentUserId() userId: number) {
    const data = await this.categoryService.findAllCategory(userId);
    return { message: '카테고리 목록 조회 성공', data };
  }

  /**
   * 카테고리 생성
   */
  @AccessTokenAuth()
  @CreateCategorySwagger()
  @Post()
  async createCategory(
    @CurrentUserId() userId: number,
    @Body() dto: CreateCategoryDto,
  ) {
    const data = await this.categoryService.createCategory(userId, dto);
    return { message: '카테고리 생성 성공', data };
  }

  /**
   * 카테고리 수정
   */
  @AccessTokenAuth()
  @UpdateCategorySwagger()
  @Patch(':categoryId')
  async updateCategory(
    @CurrentUserId() userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.updateCategory(
      categoryId,
      userId,
      dto,
    );
    return { message: '카테고리 수정 성공', data };
  }

  /**
   * 카테고리 삭제
   */
  @AccessTokenAuth()
  @DeleteCategorySwagger()
  @Delete(':categoryId')
  async deleteCategory(
    @CurrentUserId() userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    await this.categoryService.deleteCategory(categoryId, userId);
    return { message: '카테고리 삭제 성공', data: null };
  }

  /**
   * 카테고리 순서 변경
   */

  @AccessTokenAuth()
  @ReorderCategorySwagger()
  @Patch('/order')
  async reorderCategory(
    @CurrentUserId() userId: number,
    @Body() dto: ReorderCategoryDto,
  ) {
    const data = await this.categoryService.reorderCategory(userId, dto);
    return { message: '카테고리 순서 변경 성공', data };
  }
}
