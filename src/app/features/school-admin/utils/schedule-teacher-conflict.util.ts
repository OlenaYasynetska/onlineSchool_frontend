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
/** Trim, collapse spaces, lower-case — for comparing room labels. */
export function normalizeScheduleRoomKey(
  room: string | null | undefined
): string | null {
  const t = room?.trim().replace(/\s+/g, ' ');
  if (!t) return null;
  return t.toLowerCase();
}

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

export interface GroupDraftLike {
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface RoomDraftLike {
  room: string | null | undefined;
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

/** Same class (group) cannot have two lessons at once — different teachers still conflict. */
export function findGroupScheduleConflicts(
  draft: GroupDraftLike,
  existing: readonly ScheduleSlot[],
  excludeSlotId?: string | null
): ScheduleSlot[] {
  const gid = draft.groupId?.trim();
  if (!gid) return [];
  return existing.filter((s) => {
    if (excludeSlotId && s.id === excludeSlotId) return false;
    if (s.groupId !== gid) return false;
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

/** Same physical room cannot host two lessons at once (only when `room` is set on both sides). */
export function findRoomScheduleConflicts(
  draft: RoomDraftLike,
  existing: readonly ScheduleSlot[],
  excludeSlotId?: string | null
): ScheduleSlot[] {
  const roomKey = normalizeScheduleRoomKey(draft.room);
  if (!roomKey) return [];
  return existing.filter((s) => {
    if (excludeSlotId && s.id === excludeSlotId) return false;
    if (normalizeScheduleRoomKey(s.room) !== roomKey) return false;
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

/**
 * Every slot id that participates in at least one overlap (same teacher OR same group OR same room,
 * same weekday, overlapping time & validity). Used to highlight bad data already in DB.
 */
export function allStoredScheduleConflictSlotIds(
  slots: readonly ScheduleSlot[]
): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      if (a.dayOfWeek !== b.dayOfWeek) continue;
      if (
        !scheduleTimeRangesOverlap(
          a.startTime,
          a.endTime,
          b.startTime,
          b.endTime
        )
      ) {
        continue;
      }
      if (
        !scheduleValidityRangesOverlap(
          a.validFrom,
          a.validUntil,
          b.validFrom,
          b.validUntil
        )
      ) {
        continue;
      }
      const teacherOverlap = a.teacherId === b.teacherId;
      const groupOverlap = a.groupId === b.groupId;
      const ka = normalizeScheduleRoomKey(a.room);
      const kb = normalizeScheduleRoomKey(b.room);
      const roomOverlap = ka !== null && kb !== null && ka === kb;
      if (teacherOverlap || groupOverlap || roomOverlap) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}
