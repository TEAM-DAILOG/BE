// 서버 시간대(TZ)가 UTC여도 상관없이 한국시간(KST, UTC+9) 기준 "오늘" 범위를 계산한다.
// 한국은 서머타임이 없어서 고정 오프셋(+9시간)으로 계산해도 항상 정확하다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstTodayRange(): { start: Date; end: Date } {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const year = kstNow.getUTCFullYear();
  const month = kstNow.getUTCMonth();
  const date = kstNow.getUTCDate();

  const start = new Date(
    Date.UTC(year, month, date, 0, 0, 0, 0) - KST_OFFSET_MS,
  );
  const end = new Date(
    Date.UTC(year, month, date, 23, 59, 59, 999) - KST_OFFSET_MS,
  );

  return { start, end };
}
