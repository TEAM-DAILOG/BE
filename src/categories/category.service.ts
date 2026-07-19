import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CategoryColor, CategoryEntity } from './entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoryDto,
} from './category.dto';

import {
  BadRequestException,
  NotFoundException,
} from '../global/error/custom.exception';

const DEFAULT_CATEGORY_NAME = '할 일';
const DEFAULT_CATEGORY_COLOR = CategoryColor.BLUE;

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // 내부 카테고리 조회
  private async findOneCategoryEntity(
    categoryId: number,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });

    if (!category) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    return category;
  }

  // 카테고리 조회
  async findAllCategory(userId: number): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      where: { userId },
      order: { categoryOrder: 'ASC' },
    });
  }

  // 회원가입 시 기본 카테고리 생성
  async createDefaultCategory(
    userId: number,
    manager?: EntityManager,
  ): Promise<CategoryEntity> {
    const categoryRepository =
      manager?.getRepository(CategoryEntity) ?? this.categoryRepository;

    const defaultCategory = categoryRepository.create({
      userId,
      categoryName: DEFAULT_CATEGORY_NAME,
      categoryColor: DEFAULT_CATEGORY_COLOR,
      categoryOrder: 1,
    });

    return categoryRepository.save(defaultCategory);
  }

  // 카테고리 생성
  async createCategory(
    userId: number,
    dto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const duplicateColor = await this.categoryRepository.findOne({
      where: { userId, categoryColor: dto.categoryColor },
    });

    if (duplicateColor) {
      throw new BadRequestException('이미 사용 중인 카테고리 색상입니다.');
    }

    const lastCategory = await this.categoryRepository.findOne({
      where: { userId },
      order: { categoryOrder: 'DESC' },
    });

    const nextOrder = lastCategory ? lastCategory.categoryOrder + 1 : 1;

    const category = this.categoryRepository.create({
      userId,
      categoryName: dto.categoryName,
      categoryColor: dto.categoryColor,
      categoryOrder: nextOrder,
    });

    return this.categoryRepository.save(category);
  }

  // 카테고리 수정
  async updateCategory(
    categoryId: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOneCategoryEntity(categoryId);

    if (dto.categoryColor && dto.categoryColor !== category.categoryColor) {
      const duplicateColor = await this.categoryRepository.findOne({
        where: { userId: category.userId, categoryColor: dto.categoryColor },
      });

      if (duplicateColor) {
        throw new BadRequestException('이미 사용 중인 카테고리 색상입니다.');
      }
    }

    category.categoryName = dto.categoryName ?? category.categoryName;
    category.categoryColor = dto.categoryColor ?? category.categoryColor;

    return this.categoryRepository.save(category);
  }

  // 카테고리 삭제
  async deleteCategory(categoryId: number) {
    await this.findOneCategoryEntity(categoryId);
    return this.categoryRepository.softDelete(categoryId);
  }

  // 카테고리 순서 변경
  async reorderCategory(dto: ReorderCategoryDto): Promise<CategoryEntity[]> {
    const updatedCategories: CategoryEntity[] = [];

    for (const category of dto.categories) {
      const foundCategory = await this.findOneCategoryEntity(
        category.categoryId,
      );

      foundCategory.categoryOrder = category.categoryOrder;

      const saved = await this.categoryRepository.save(foundCategory);
      updatedCategories.push(saved);
    }

    return updatedCategories;
  }
}