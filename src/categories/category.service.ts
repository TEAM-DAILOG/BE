import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CategoryColor, CategoryEntity } from './entities/category.entity';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoryDto,
} from './category.dto';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../global/error/custom.exception';

const DEFAULT_CATEGORY_NAME = '할 일';
const DEFAULT_CATEGORY_COLOR = CategoryColor.BLUE;
const MAX_CATEGORY_COUNT = 5;

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // 엔티티 → 응답 DTO 변환 (userId, 타임스탬프 등 내부 필드 제외)
  private toResponseDto(category: CategoryEntity): CategoryResponseDto {
    const { categoryId, categoryName, categoryColor, categoryOrder } = category;
    return { categoryId, categoryName, categoryColor, categoryOrder };
  }

  // 내부 카테고리 조회 (소유권 검증 포함)
  private async findOneCategoryEntity(
    categoryId: number,
    userId: number,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    return category;
  }

  // 카테고리 조회
  async findAllCategory(userId: number): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { userId },
      order: { categoryOrder: 'ASC' },
    });

    return categories.map((category) => this.toResponseDto(category));
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
  ): Promise<CategoryResponseDto> {
    const categoryCount = await this.categoryRepository.count({
      where: { userId },
    });

    if (categoryCount >= MAX_CATEGORY_COUNT) {
      throw new ConflictException(
        '카테고리는 최대 5개까지 생성할 수 있습니다.',
      );
    }

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

    const saved = await this.categoryRepository.save(category);
    return this.toResponseDto(saved);
  }

  // 카테고리 수정
  async updateCategory(
    categoryId: number,
    userId: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findOneCategoryEntity(categoryId, userId);

    if (dto.categoryColor && dto.categoryColor !== category.categoryColor) {
      const duplicateColor = await this.categoryRepository.findOne({
        where: { userId, categoryColor: dto.categoryColor },
      });

      if (duplicateColor) {
        throw new BadRequestException('이미 사용 중인 카테고리 색상입니다.');
      }
    }

    category.categoryName = dto.categoryName ?? category.categoryName;
    category.categoryColor = dto.categoryColor ?? category.categoryColor;

    const saved = await this.categoryRepository.save(category);
    return this.toResponseDto(saved);
  }

  // 카테고리 삭제
  async deleteCategory(categoryId: number, userId: number): Promise<void> {
    await this.findOneCategoryEntity(categoryId, userId);
    await this.categoryRepository.softDelete(categoryId);
  }

  // 카테고리 순서 변경
  // 카테고리 순서 변경
  async reorderCategory(
    userId: number,
    dto: ReorderCategoryDto,
  ): Promise<CategoryResponseDto[]> {
    const existingCategories = await this.categoryRepository.find({
      where: { userId },
    });

    const existingIds = new Set(existingCategories.map((c) => c.categoryId));
    const requestedIds = dto.categories.map((c) => c.categoryId);

    // 드래그 앤 드롭 방식이므로 보유한 카테고리 전체가 요청에 포함되어야 함
    if (requestedIds.length !== existingCategories.length) {
      throw new BadRequestException(
        '보유한 카테고리 전체의 순서를 보내야 합니다.',
      );
    }

    // 요청에 담긴 categoryId가 전부 이 유저 소유인지 확인 (IDOR 방지)
    const hasForeignCategory = requestedIds.some((id) => !existingIds.has(id));

    if (hasForeignCategory) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    // categoryId 중복 요청 방지
    const uniqueIds = new Set(requestedIds);
    if (uniqueIds.size !== requestedIds.length) {
      throw new BadRequestException('중복된 카테고리 요청입니다.');
    }

    // order 값 자체의 중복 방지
    const orderValues = dto.categories.map((c) => c.categoryOrder);
    const uniqueOrders = new Set(orderValues);
    if (uniqueOrders.size !== orderValues.length) {
      throw new BadRequestException('순서 값이 중복되었습니다.');
    }

    const categoryMap = new Map(
      existingCategories.map((c) => [c.categoryId, c]),
    );

    const categoriesToSave: CategoryEntity[] = [];

    for (const item of dto.categories) {
      const category = categoryMap.get(item.categoryId);
      category!.categoryOrder = item.categoryOrder;
      categoriesToSave.push(category!);
    }

    const saved = await this.categoryRepository.save(categoriesToSave);

    return saved
      .sort((a, b) => a.categoryOrder - b.categoryOrder)
      .map((category) => this.toResponseDto(category));
  }
}
