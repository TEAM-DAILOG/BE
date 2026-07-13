import { ApiProperty } from '@nestjs/swagger';
import { RecommendEntity } from '../entities/ai-recommend.entitiy';

// 생성은 DTO없이 사용자의 오늘 일기를 service에서 읽어서 처리한다
export class RecommendCreateResponseDTO {
  @ApiProperty({ example: '추천 일정의 id 입니다' })
  recommendId: number;

  @ApiProperty({ example: '추천 일정 카테고리의 id 입니다' })
  categoryId: number;

  @ApiProperty({ example: '추천 일정 카테고리의 제목입니다' })
  categoryTitle: string;

  @ApiProperty({ example: '추천 일정의 제목입니다' })
  scheduleTitle: string;

  //TODO : 카테고리 추가 시 연결
  constructor(recommmend: RecommendEntity) {
    this.recommendId = recommmend.recommendId;
    this.scheduleTitle = recommmend.title;
  }
}

export class RecommendDTO {
  @ApiProperty({ example: '추천 일정의 id 입니다' })
  recommendId: number;

  @ApiProperty({ example: '추천 일정 카테고리의 id 입니다' })
  categoryId: number;

  @ApiProperty({ example: '추천 일정 카테고리의 제목입니다' })
  categoryTitle: string;

  @ApiProperty({ example: '추천 일정 카테고리의 색깔입니다' })
  //TODO : ENUM으로 변경
  categoryColor: string;

  @ApiProperty({ example: '추천 일정의 제목입니다' })
  scheduleTitle: string;

  @ApiProperty({ example: '추천 일정의 추가 여부입니다' })
  isAdded: boolean;

  //TODO : 카테고리 추가 시 연결
  constructor(recommend: RecommendEntity) {
    this.recommendId = recommend.recommendId;
    this.scheduleTitle = recommend.title;
    this.isAdded = recommend.isAdded;
  }
}

export class RecommendListDTO {
  @ApiProperty({ example: '추천일정 개수 입니다' })
  recommendedScheduleCount: number;

  @ApiProperty({ example: '추천일정 리스트 입니다' })
  recommendedSchedules: RecommendDTO[];

  constructor(recommendList: RecommendEntity[]) {
    this.recommendedScheduleCount = recommendList.length;
    this.recommendedSchedules = recommendList.map(
      (recommend) => new RecommendDTO(recommend),
    );
  }
}
