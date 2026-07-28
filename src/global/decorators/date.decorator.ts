import { Transform } from 'class-transformer';
import { extractLocalDate, parseTimeWithOffset } from '../utills/date.utill';

// 일기
export function ToLocalDate() {
  return Transform(({ value }) => extractLocalDate(value));
}

// 리마인드 알람 입력
export function ToUtcTime() {
  return Transform(({ value }) =>
    value === null ? null : parseTimeWithOffset(value),
  );
}
