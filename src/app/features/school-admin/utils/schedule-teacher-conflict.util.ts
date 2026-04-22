import type { ScheduleSlot } from '../models/schedule-slot.model';

/** Parse `HH:mm` or backend `H:mm:ss` to minutes from midnight. */
export function parseScheduleTimeToMinutes(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

/** Half-open overlap: intervals [start, end) intersect. */
export function scheduleTimeRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const as = parseScheduleTimeToMinutes(aStart);
  const ae = parseScheduleTimeToMinutes(aEnd);
  const bs = parseScheduleTimeToMinutes(bStart);
  const be = parseScheduleTimeToMinutes(bEnd);
  if (as === null || ae === null || bs === null || be === null) return false;
  if (ae <= as || be <= bs) return false;
  return as < be && bs < ae;
}

/**
 * Whether two optional validity ranges can both apply on at least one calendar day.
 * Empty bounds are treated as open-ended (`yyyy-MM-dd` string order).
 */
export function scheduleValidityRangesOverlap(
  aFrom: string | null | undefined,
  aUntil: string | null | undefined,
  bFrom: string | null | undefined,
  bUntil: string | null | undefined
): boolean {
  const eff = (v: string | null | undefined, edge: 'from' | 'until'): string => {
    const t = v?.trim();
    if (t) return t;
    return edge === 'from' ? '0001-01-01' : '9999-12-31';
  };
  const af = eff(aFrom, 'from');
  const au = eff(aUntil, 'until');
  const bf = eff(bFrom, 'from');
  const bu = eff(bUntil, 'until');
  return af <= bu && bf <= au;
}

export interface DraftSlotLike {
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom?: string | null;
  validUntil?: string | null;
}

/** Slots that share teacher, day, overlapping time & validity with the draft (excluding `excludeSlotId`). */
export function findTeacherScheduleConflicts(
  draft: DraftSlotLike,
  existing: readonly ScheduleSlot[],
  excludeSlotId?: string | null
): ScheduleSlot[] {
  const tid = draft.teacherId?.trim();
  if (!tid) return [];
  return existing.filter((s) => {
    if (excludeSlotId && s.id === excludeSlotId) return false;
    if (s.teacherId !== tid) return false;
    if (s.dayOfWeek !== draft.dayOfWeek) return false;
    if (
      !scheduleTimeRangesOverlap(
        s.startTime,
        s.endTime,
        draft.startTime,
        draft.endTime
      )
    ) {
      return false;
    }
    if (
      !scheduleValidityRangesOverlap(
        s.validFrom,
        s.validUntil,
        draft.validFrom,
        draft.validUntil
      )
    ) {
      return false;
    }
    return true;
  });
}
