import { env } from '../config/env.js';

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

function partsInTimeZone(date: Date, timeZone = env.practiceTimeZone): DateParts {
  const parts = formatterFor(timeZone).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function dateOnlyFromParts({ year, month, day }: Pick<DateParts, 'year' | 'month' | 'day'>) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone = env.practiceTimeZone,
) {
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = targetAsUtc;

  // Iteratively correct the UTC instant until it formats as the requested
  // wall-clock time in the practice timezone. This handles DST boundaries
  // without depending on the server's local timezone.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = partsInTimeZone(new Date(utc), timeZone);
    const observedAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    const delta = observedAsUtc - targetAsUtc;
    if (delta === 0) break;
    utc -= delta;
  }

  return new Date(utc);
}

export function dateOnlyInPracticeTimeZone(
  value = new Date(),
  timeZone = env.practiceTimeZone,
): string {
  return dateOnlyFromParts(partsInTimeZone(value, timeZone));
}

export function startOfPracticeDayInstant(
  value = new Date(),
  timeZone = env.practiceTimeZone,
): Date {
  const parts = partsInTimeZone(value, timeZone);
  return zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0, timeZone);
}

export function startOfToday(): Date {
  return parseDateOnly(dateOnlyInPracticeTimeZone()) as Date;
}

export function startOfWeek(today = startOfToday()): Date {
  const value = new Date(today);
  const day = value.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  value.setUTCDate(value.getUTCDate() + mondayOffset);
  value.setUTCHours(12, 0, 0, 0);
  return value;
}

export function startOfWeekInstant(
  value = new Date(),
  timeZone = env.practiceTimeZone,
): Date {
  const todayDateOnly = parseDateOnly(dateOnlyInPracticeTimeZone(value, timeZone)) as Date;
  const weekStart = startOfWeek(todayDateOnly);
  return zonedTimeToUtc(
    weekStart.getUTCFullYear(),
    weekStart.getUTCMonth() + 1,
    weekStart.getUTCDate(),
    0,
    0,
    0,
    timeZone,
  );
}

export function startOfMonthInstant(
  value = new Date(),
  timeZone = env.practiceTimeZone,
): Date {
  const parts = partsInTimeZone(value, timeZone);
  return zonedTimeToUtc(parts.year, parts.month, 1, 0, 0, 0, timeZone);
}

export function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  next.setUTCHours(12, 0, 0, 0);
  return next;
}

export function parseDateOnly(value: unknown): Date | null {
  if (!value) return null;
  const text = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return parsed;
}

export function formatDate(value: Date | null | undefined): string {
  if (!value) return '';
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-');
}
