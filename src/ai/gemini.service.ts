import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

// ponytail: '-latest' 별칭 사용 — 특정 버전 고정 시 이번처럼 구모델 폐기로 깨질 수 있음
const QUESTION_MODEL = 'gemini-flash-lite-latest';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly questionPrompt: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY_DEV'),
    });
    this.questionPrompt = this.configService.get<string>(
      'GEMINI_QUESTION_PROMPT',
    )!;
  }

  async generateTodayQuestion(): Promise<string> {
    const response = await this.client.models.generateContent({
      model: QUESTION_MODEL,
      contents: this.questionPrompt,
    });

    return response.text!.trim();
  }
}
