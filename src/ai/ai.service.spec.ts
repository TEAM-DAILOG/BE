import { AiService } from './ai.service';
import { QuestionEntity } from './entities/ai-question.entity';
import { GeminiService } from './gemini.service';

describe('AiService', () => {
  const makeRepository = (existing: QuestionEntity | null) => ({
    findOne: jest.fn().mockResolvedValue(existing),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ questionId: 1, ...entity })),
  });

  const makeGemini = () =>
    ({
      generateTodayQuestion: jest.fn().mockResolvedValue('생성된 질문'),
    }) as unknown as GeminiService;

  it('오늘의 질문이 없으면 Gemini로 생성해서 저장한다', async () => {
    const repository = makeRepository(null);
    const gemini = makeGemini();
    const service = new AiService(repository as any, gemini);

    const result = await service.getTodayQuestion();

    expect(gemini.generateTodayQuestion).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.content).toBe('생성된 질문');
  });

  it('오늘의 질문이 이미 있으면 Gemini를 호출하지 않고 그대로 반환한다', async () => {
    const existing = {
      questionId: 1,
      content: '기존 질문',
      targetDate: '2026-07-15',
    } as QuestionEntity;
    const repository = makeRepository(existing);
    const gemini = makeGemini();
    const service = new AiService(repository as any, gemini);

    const result = await service.getTodayQuestion();

    expect(gemini.generateTodayQuestion).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(result.content).toBe('기존 질문');
  });

  it('재생성 요청 시 기존 질문의 내용을 덮어쓴다', async () => {
    const existing = {
      questionId: 1,
      content: '기존 질문',
      targetDate: '2026-07-15',
    } as QuestionEntity;
    const repository = makeRepository(existing);
    const gemini = makeGemini();
    const service = new AiService(repository as any, gemini);

    const result = await service.regenerateTodayQuestion();

    expect(gemini.generateTodayQuestion).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ questionId: 1, content: '생성된 질문' }),
    );
    expect(result.content).toBe('생성된 질문');
  });
});
