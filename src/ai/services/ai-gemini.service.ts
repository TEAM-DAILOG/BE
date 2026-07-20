import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';

// ponytail: '-latest' 별칭 사용 — 특정 버전 고정 시 이번처럼 구모델 폐기로 깨질 수 있음
const MODEL = 'gemini-flash-lite-latest';

export interface RecommendationItem {
  // null이면 더 이상 추천할 수 있는(기존 목록과 겹치지 않는) 일정이 없다는 뜻
  scheduleTitle: string | null;
  categoryId: number | null;
  newCategoryName: string | null;
}

const RECOMMENDATION_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scheduleTitle: { type: Type.STRING, nullable: true },
    categoryId: { type: Type.INTEGER, nullable: true },
    newCategoryName: { type: Type.STRING, nullable: true },
  },
};

const RECOMMENDATION_RESPONSE_SCHEMA = RECOMMENDATION_ITEM_SCHEMA;

const INITIAL_RECOMMENDATION_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: RECOMMENDATION_ITEM_SCHEMA,
};

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly questionPrompt: string;
  private readonly answerPrompt: string;
  private readonly recommendPrompt: string;
  private readonly initialRecommendPrompt: string;
  private readonly stressPrompt: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY_DEV'),
    });
    this.questionPrompt = this.configService.get<string>(
      'GEMINI_QUESTION_PROMPT',
    )!;
    this.answerPrompt = this.configService.get<string>('GEMINI_ANSWER_PROMPT')!;
    this.recommendPrompt = this.configService.get<string>(
      'GEMINI_RECOMMEND_PROMPT',
    )!;
    this.initialRecommendPrompt = this.configService.get<string>(
      'GEMINI_INITIAL_RECOMMEND_PROMPT',
    )!;
    this.stressPrompt = this.configService.get<string>('GEMINI_STRESS_PROMPT')!;
  }

  async generateTodayQuestion(): Promise<string> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: this.questionPrompt,
    });

    return response.text!.trim();
  }

  async generateAnswer(diaryContent: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: `${this.answerPrompt}\n\n일기 내용:\n${diaryContent}`,
    });

    return response.text!.trim();
  }

  async generateRecommendation(
    diaryContent: string,
    categories: { categoryId: number; categoryName: string }[],
    existingTitles: string[],
  ): Promise<RecommendationItem> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: `${this.recommendPrompt}\n\n일기 내용:\n${diaryContent}\n\n사용자 카테고리 목록(JSON):\n${JSON.stringify(categories)}\n\n오늘 이미 추천된 일정 제목 목록(JSON, 이 목록과 겹치는 일정은 추천하면 안 됨):\n${JSON.stringify(existingTitles)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RECOMMENDATION_RESPONSE_SCHEMA,
      },
    });

    return JSON.parse(response.text!) as RecommendationItem;
  }

  // 오늘 첫 호출 전용: 기존 추천 목록과 비교할 필요가 없어 맥락을 분리한 프롬프트로,
  // 서로 겹치지 않는 일정을 한 번에 최대 3개까지(부족하면 그보다 적게) 배열로 받는다.
  async generateInitialRecommendations(
    diaryContent: string,
    categories: { categoryId: number; categoryName: string }[],
  ): Promise<RecommendationItem[]> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: `${this.initialRecommendPrompt}\n\n일기 내용:\n${diaryContent}\n\n사용자 카테고리 목록(JSON):\n${JSON.stringify(categories)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: INITIAL_RECOMMENDATION_RESPONSE_SCHEMA,
      },
    });

    return JSON.parse(response.text!) as RecommendationItem[];
  }

  async generateStressInsight(
    diaryContent: string,
    schedules: { title: string; date: string }[],
  ): Promise<string> {
    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: `${this.stressPrompt}\n\n일기 내용:\n${diaryContent}\n\n이번 달 등록된 일정 목록(JSON):\n${JSON.stringify(schedules)}`,
    });

    return response.text!.trim();
  }
}
