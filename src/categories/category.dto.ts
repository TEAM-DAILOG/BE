import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryColor } from './entities/category.entity';

// 카테고리 조회 응답 DTO
export class CategoryResponseDto {
  categoryId: number;
  categoryName: string;
  categoryColor: CategoryColor;
  categoryOrder: number;
}

// 카테고리 생성 DTO
export class CreateCategoryDto {
  // 카테고리 이름
  @IsNotEmpty({ message: '카테고리 이름은 필수입니다.' })
  @IsString()
  @MaxLength(30, { message: '카테고리 이름은 30자 이하로 입력해주세요.' })
  categoryName: string;

  // 카테고리 색상
  @IsEnum(CategoryColor)
  categoryColor: CategoryColor;
}

// 카테고리 수정 DTO
export class UpdateCategoryDto {
  // 카테고리 이름
  @IsOptional()
  @IsNotEmpty({ message: '카테고리 이름은 필수입니다.' })
  @IsString()
  @MaxLength(30, { message: '카테고리 이름은 30자 이하로 입력해주세요.' })
  categoryName?: string;

  // 카테고리 색상
  @IsOptional()
  @IsEnum(CategoryColor)
  categoryColor?: CategoryColor;
}

// 카테고리 순서 변경 DTO
export class CategoryOrderDto {
  @IsNumber()
  categoryId: number;
  @IsNumber()
  categoryOrder: number;
}

// 카테고리 순서 변경 요청 DTO
export class ReorderCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderDto)
  categories: CategoryOrderDto[];
}
