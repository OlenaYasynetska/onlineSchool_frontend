/**
 * X-axis tick thinning for teacher homework stars chart (daily buckets from API).
 * When the range spans several months, show only 1st, 10th, 20th, and last day of each month.
 */

function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Inclusive count of distinct calendar months touched by [from, to]. */
export function calendarMonthsSpannedInclusive(fromIso: string, toIso: string): number {
  const a = parseIsoLocal(fromIso);
  const b = parseIsoLocal(toIso);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1;
}

/**
 * Backend daily labels look like "24 Apr" (day + short EN month); monthly buckets look like "Apr 2026".
 */
export function isDailyHomeworkStarsBucketLabels(labels: readonly string[]): boolean {
  if (!labels.length) return false;
  const s = labels[0].trim();
  return /^\d{1,2}\s+/.test(s) && !/\d{4}\s*$/.test(s);
}

/** Indices that should show an x-axis label (others hidden via Apex formatter). */
export function sparseHomeworkStarsDayTickIndices(
  fromIso: string,
  pointCount: number
): Set<number> {
  const set = new Set<number>();
  const base = parseIsoLocal(fromIso);
  for (let i = 0; i < pointCount; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dom = d.getDate();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (dom === 1 || dom === 10 || dom === 20 || dom === lastDay) {
      set.add(i);
    }
  }
  return set;
}

export function homeworkStarsChartSparseDayAxis(
  labels: readonly string[],
  fromIso: string,
  toIso: string,
  /** Use 2 so any multi-month daily range gets sparse ticks (e.g. 3-month preset). */
  minCalendarMonths = 2
): { sparse: boolean; tickIndices: Set<number> } {
  if (
    !isDailyHomeworkStarsBucketLabels(labels) ||
    calendarMonthsSpannedInclusive(fromIso, toIso) < minCalendarMonths
  ) {
    return { sparse: false, tickIndices: new Set() };
  }
  return {
    sparse: true,
    tickIndices: sparseHomeworkStarsDayTickIndices(fromIso, labels.length),
  };
}
