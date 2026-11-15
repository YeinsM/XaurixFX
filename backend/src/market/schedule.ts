export const MINUTES_PER_DAY = 1440;

/** Minute-of-day (UTC) slots evenly spread over 24h, starting at `offsetMinute`. */
export function spreadSlots(runsPerDay: number, offsetMinute = 0): number[] {
  if (!Number.isInteger(runsPerDay) || runsPerDay < 1 || runsPerDay > MINUTES_PER_DAY) {
    throw new Error('runsPerDay must be an integer between 1 and 1440.');
  }
  if (!Number.isInteger(offsetMinute) || offsetMinute < 0 || offsetMinute >= MINUTES_PER_DAY) {
    throw new Error('offsetMinute must be an integer between 0 and 1439.');
  }
  const step = Math.floor(MINUTES_PER_DAY / runsPerDay);
  return Array.from({ length: runsPerDay }, (_, i) => offsetMinute + i * step).filter(slot => slot < MINUTES_PER_DAY);
}

/**
 * Latest slot of the current UTC day that has started and has not been served by
 * `lastRunAt`, or null. Missed slots are not stacked: only the latest one runs.
 */
export function dueSlot(slots: readonly number[], now: Date, lastRunAt: Date | null): number | null {
  const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const minuteOfDay = Math.floor((now.getTime() - dayStart) / 60_000);
  const current = slots.filter(slot => slot <= minuteOfDay).at(-1);
  if (current === undefined) return null;
  const slotStart = dayStart + current * 60_000;
  return lastRunAt && lastRunAt.getTime() >= slotStart ? null : current;
}
