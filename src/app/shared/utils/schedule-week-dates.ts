/** Local calendar date as `yyyy-MM-dd` (no UTC shift). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday 00:00 local of the week containing `ref`. */
export function isoDateMondayOfWeek(ref: Date): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + mondayOffset);
  return toIsoDate(d);
}

export function addWeeksIso(isoMonday: string, deltaWeeks: number): string {
  const d = parseIsoLocal(isoMonday);
  d.setDate(d.getDate() + 7 * deltaWeeks);
  return isoDateMondayOfWeek(d);
}

/** Backend `dayOfWeek`: 1 = Mon … 7 = Sun. */
export function calendarDayInSchoolWeek(
  isoMonday: string,
  dayOfWeek: number
): string {
  const base = parseIsoLocal(isoMonday);
  base.setDate(base.getDate() + (dayOfWeek - 1));
  return toIsoDate(base);
}

/** Slot applies to this calendar day if optional validity range includes `dayIso`. */
export function slotVisibleOnCalendarDay(
  validFrom: string | null | undefined,
  validUntil: string | null | undefined,
  dayIso: string
): boolean {
  const vf = validFrom?.trim();
  const vu = validUntil?.trim();
  if (vf && dayIso < vf) return false;
  if (vu && dayIso > vu) return false;
  return true;
}

export function formatWeekRange(isoMonday: string): string {
  const start = parseIsoLocal(isoMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatShortDayDate(isoDay: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(parseIsoLocal(isoDay));
}
