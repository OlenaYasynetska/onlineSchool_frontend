export type GradingMethod = 'sum' | 'average';

export type GradingScale = 'stars_1_3' | 'austrian_1_5';

export interface GradingDisplayLabels {
  readonly unitLabel: string;
  readonly unitLabelPlural: string;
  readonly columnLabel: string;
  readonly progressCardLabel: string;
  readonly headlineAriaLabel: string;
}

/** Німецькі назви австрійської шкали (1 — найкраща). */
export const AUSTRIAN_GRADE_LABELS: Readonly<Record<number, string>> = {
  1: 'Sehr gut',
  2: 'Gut',
  3: 'Befriedigend',
  4: 'Genügend',
  5: 'Nicht genügend',
};

export function normalizeGradingScale(
  value: string | null | undefined
): GradingScale {
  return value === 'austrian_1_5' ? 'austrian_1_5' : 'stars_1_3';
}

export function gradeChoicesForScale(
  scale: GradingScale | string | null | undefined
): number[] {
  return normalizeGradingScale(scale) === 'austrian_1_5'
    ? [1, 2, 3, 4, 5]
    : [1, 2, 3];
}

export function defaultGradeForScale(
  scale: GradingScale | string | null | undefined
): number {
  return normalizeGradingScale(scale) === 'austrian_1_5' ? 3 : 2;
}

export function gradeChoiceLabel(
  value: number,
  scale: GradingScale | string | null | undefined
): string {
  if (normalizeGradingScale(scale) === 'austrian_1_5') {
    const label = AUSTRIAN_GRADE_LABELS[value];
    return label ? `${value} — ${label}` : String(value);
  }
  return String(value);
}

export function gradingScaleHint(
  scale: GradingScale | string | null | undefined
): string {
  if (normalizeGradingScale(scale) === 'austrian_1_5') {
    return 'Austrian scale: 1 — Sehr gut (best), 5 — Nicht genügend';
  }
  return 'Stars: 1 — weak, 3 — excellent';
}

export function formatGradingScore(
  value: number,
  method: GradingMethod | string | null | undefined
): string {
  if (method === 'average') {
    return Number.isInteger(value) ? value.toFixed(1) : value.toFixed(1);
  }
  return String(Math.round(value));
}

export function gradingDisplayLabels(
  method: GradingMethod | string | null | undefined,
  scale?: GradingScale | string | null | undefined
): GradingDisplayLabels {
  const austrian = normalizeGradingScale(scale) === 'austrian_1_5';
  if (method === 'average') {
    return {
      unitLabel: austrian ? 'average grade' : 'average',
      unitLabelPlural: austrian ? 'average grade' : 'average',
      columnLabel: austrian ? 'Average grade' : 'Average',
      progressCardLabel: austrian ? 'Average grade (graded)' : 'Average (graded)',
      headlineAriaLabel: austrian ? 'Average grade' : 'Average star rating',
    };
  }
  if (austrian) {
    return {
      unitLabel: 'grade',
      unitLabelPlural: 'grades',
      columnLabel: 'Grade',
      progressCardLabel: 'Grades (graded)',
      headlineAriaLabel: 'Total grades',
    };
  }
  return {
    unitLabel: 'stars',
    unitLabelPlural: 'stars',
    columnLabel: 'Stars',
    progressCardLabel: 'Stars (graded)',
    headlineAriaLabel: 'Total stars',
  };
}

export function normalizeGradingMethod(
  value: string | null | undefined
): GradingMethod {
  return value === 'average' ? 'average' : 'sum';
}
