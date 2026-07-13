import { ApiProperty } from '@nestjs/swagger';

export class mostFrequentCategoryDto {
  @ApiProperty({ description: '가장 많이 사용한 카테고리 ID입니다' })
  categoryId: number;

  @ApiProperty({ description: '가장 많이 사용한 카테고리 이름입니다' })
  categoryName: string;

  //TODO 카테고리 생성시 constructor추가
}

export class statsMainDTO {
  @ApiProperty({ description: '가장 많이 사용한 카테고리정보' })
  mostFrequentCategory: mostFrequentCategoryDto;

  @ApiProperty({ description: '추천일정 목록 입니다' })
  //TODO : 추후 ai-recommendDTO 연결
  recommendedSchedules: any[];

  @ApiProperty({ description: '스트레스 관련 정보 입니다' })
  stress: 'string';

  //TODO : 추후 constructor추가
}

//카테고리 현재 구현
export class categoryRankScheduleDTO {
  @ApiProperty({ description: '스케쥴 id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;
}

export class CategoryRankInfoDTO {
  @ApiProperty({ description: '카테고리 ID입니다' })
  categoryId: number;

  @ApiProperty({ description: '카테고리 이름입니다' })
  categoryName: string;

  @ApiProperty({ description: '카테고리 사용 횟수입니다' })
  count: number;

  @ApiProperty({ description: '카테고리 색깔입니다' })
  //TODO : 추후 enum으로 변경
  color: string;

  @ApiProperty({ description: '카테고리별 스케쥴 목록입니다' })
  schedules: categoryRankScheduleDTO[];

  //TODO : 추후 constructor추가
}

export class scheduledetailDTO {
  @ApiProperty({ description: '가장 많이 사용된 카테고리 정보입니다' })
  mostFrequentCategory: mostFrequentCategoryDto;

  @ApiProperty({ description: '카테고리별 사용 횟수 정보입니다' })
  categoryRankInfo: CategoryRankInfoDTO[];
}

export class SceheduleStatsDTO {
  @ApiProperty({ description: '스케쥴 Id입니다' })
  scheduleId: number;

  @ApiProperty({ description: '스케쥴 제목입니다' })
  title: string;

  @ApiProperty({ description: '스케쥴 날짜입니다' })
  date: Date;

  @ApiProperty({ description: '스케쥴 카테고리 Id입니다' })
  categoryId: number;

  @ApiProperty({ description: '스케쥴 카테고리 이름입니다' })
  categoryName: string;

  @ApiProperty({ description: '스케쥴 카테고리 색깔입니다' })
  //TODO : 추후 enum으로 변경
  categoryColor: string;

  //TODO : 추후 constructor추가
}

export class incompletedSceheduleStatsDTO {
  @ApiProperty({ description: '완료되지 않은 스케쥴 개수입니다' })
  incompletedScheduleCount: number;

  @ApiProperty({ description: '완료되지 않은 스케쥴비율입니다' })
  incompletedScheduleRate: number;

  @ApiProperty({ description: '분석 대상 월 입니다' })
  targetMonth: string;

  @ApiProperty({ description: '완료되지 않은 스케쥴 목록입니다' })
  incompletedSchedules: SceheduleStatsDTO[];

  //TODO : 추후 constructor추가
}

export class completedSceheduleStatsDTO {
  @ApiProperty({ description: '완료된 스케쥴 개수입니다' })
  completedScheduleCount: number;

  @ApiProperty({ description: '완료된 스케쥴 목록입니다' })
  completedSchedules: SceheduleStatsDTO[];

  //TODO : 추후 constructor추가
}
