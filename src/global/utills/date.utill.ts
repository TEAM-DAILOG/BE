import { BadRequestException } from '../error/custom.exception';

const DATE_OFFSET_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

// 형식 유효성 검증
export function isValidIsoWithOffset(value: string) {
  if (!DATE_OFFSET_REGEX.test(value)) {
    throw new BadRequestException('올바른 날짜 형식이 아닙니다.');
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new BadRequestException('존재하지 않는 날짜입니다.');
  }
}

// 일기 입력
export function extractLocalDate(isoWithOffset: string): string {
  isValidIsoWithOffset(isoWithOffset);
  return isoWithOffset.split('T')[0];
}

// 일기 응답
export function toKstString(utcDate: Date): string {
  const kstTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  return kstTime.toISOString().slice(0, 19) + '+09:00';
}

const TIME_OFFSET_REGEX = /^\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/;

// 알람 입력 (HH:MM:SS+09:00 → UTC HH:MM)
export function parseTimeWithOffset(value: string): string {
  if (!TIME_OFFSET_REGEX.test(value)) {
    throw new BadRequestException(
      '올바른 시간 형식이 아닙니다. (예: 21:30:00+09:00)',
    );
  }
  const match = value.match(
    /^(\d{2}):(\d{2})(?::\d{2})?([+-])(\d{2}):(\d{2})$/,
  );
  if (!match) throw new BadRequestException('올바른 시간 형식이 아닙니다.');

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const sign = match[3] === '+' ? 1 : -1;
  const offsetHours = parseInt(match[4]);
  const offsetMinutes = parseInt(match[5]);

  const totalMinutes =
    hours * 60 + minutes - sign * (offsetHours * 60 + offsetMinutes);
  const utcMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  return `${String(Math.floor(utcMinutes / 60)).padStart(2, '0')}:${String(utcMinutes % 60).padStart(2, '0')}`;
}

// 알람 응답
export function utcTimeToKst(utcTime: string): string {
  const [h, m] = utcTime.split(':').map(Number);
  const kstHours = (h + 9) % 24;
  return `${String(kstHours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
