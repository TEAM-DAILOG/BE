// "오늘" 판단은 서버 시간대(UTC) 그대로 사용한다 — 시간대 보정 없음.
export function getTodayUtcRange(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  return {
    start: new Date(Date.UTC(year, month, date, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month, date, 23, 59, 59, 999)),
  };
}

// date-only 값("2026-07-27")과 실제 Date를 모두 "2026-07-27T00:00:00Z" 형태(밀리초 없는 ISO 8601)로 통일한다.
export function toIsoDateTime(date: string | Date): string {
  if (typeof date === 'string') {
    return `${date}T00:00:00Z`;
  }

  return date.toISOString().slice(0, 19) + 'Z';
}
