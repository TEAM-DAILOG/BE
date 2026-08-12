import { CategoryColor } from '@/src/categories/entities/category.entity';
import { RecommendEntity } from '../entities/ai-recommend.entity';

// 생성은 DTO없이 사용자의 오늘 일기를 service에서 읽어서 처리한다
export class RecommendCreateResponseDTO {
  recommendId: number;
  categoryId: number;
  categoryTitle: string;
  scheduleTitle: string;
  constructor(recommmend: RecommendEntity) {
    this.recommendId = recommmend.recommendId;
    this.scheduleTitle = recommmend.title;
    this.categoryId = recommmend.category.categoryId;
    this.categoryTitle = recommmend.category.categoryName;
  }
}

export class RecommendDTO {
  recommendId: number;
  categoryId: number;
  categoryTitle: string;
  categoryColor: CategoryColor;
  scheduleTitle: string;
  isAdded: boolean;
  constructor(recommend: RecommendEntity) {
    this.recommendId = recommend.recommendId;
    this.scheduleTitle = recommend.title;
    this.isAdded = recommend.isAdded;
    this.categoryId = recommend.category.categoryId;
    this.categoryTitle = recommend.category.categoryName;
    this.categoryColor = recommend.category.categoryColor;
  }
}

export class RecommendListDTO {
  recommendedScheduleCount: number;
  recommendedSchedules: RecommendDTO[];
  // 카테고리가 soft-delete된 추천은 목록에서 제외한다
  constructor(recommendList: RecommendEntity[]) {
    const validRecommends = recommendList.filter(
      (recommend) => recommend.category != null,
    );
    this.recommendedScheduleCount = validRecommends.length;
    this.recommendedSchedules = validRecommends.map(
      (recommend) => new RecommendDTO(recommend),
    );
  }
}
