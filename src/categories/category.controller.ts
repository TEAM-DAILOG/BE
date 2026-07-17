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

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 카테고리 목록 조회
   */
  @FindAllCategorySwagger()
  @Get()
  async findAllCategory() {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    return this.categoryService.findAllCategory(userId);
  }

  /**
   * 카테고리 생성
   */
  @CreateCategorySwagger()
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    // TODO : JWT 적용 후 수정
    const userId = 1;

    return this.categoryService.createCategory(userId, dto);
  }

  /**
   * 카테고리 수정
   */
  @UpdateCategorySwagger()
  @Patch(':categoryId')
  async updateCategory(
    @Param('categoryId', ParseIntPipe)
    categoryId: number,

    @Body()
    dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, dto);
  }

  /**
   * 카테고리 삭제
   */
  @DeleteCategorySwagger()
  @Delete(':categoryId')
  async deleteCategory(
    @Param('categoryId', ParseIntPipe)
    categoryId: number,
  ) {
    return this.categoryService.deleteCategory(categoryId);
  }

  /**
   * 카테고리 순서 변경
   */
  @ReorderCategorySwagger()
  @Patch('/order')
  async reorderCategory(
    @Body()
    dto: ReorderCategoryDto,
  ) {
    return this.categoryService.reorderCategory(dto);
  }
}
