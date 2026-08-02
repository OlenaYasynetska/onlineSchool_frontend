export type GradingMethod = 'sum' | 'average';

export interface GradingDisplayLabels {
  readonly unitLabel: string;
  readonly unitLabelPlural: string;
  readonly columnLabel: string;
  readonly progressCardLabel: string;
  readonly headlineAriaLabel: string;
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
  method: GradingMethod | string | null | undefined
): GradingDisplayLabels {
  if (method === 'average') {
    return {
      unitLabel: 'average',
      unitLabelPlural: 'average',
      columnLabel: 'Average',
      progressCardLabel: 'Average (graded)',
      headlineAriaLabel: 'Average star rating',
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
