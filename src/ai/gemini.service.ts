import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const QUESTION_MODEL = 'gemini-2.5-flash-lite';

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
