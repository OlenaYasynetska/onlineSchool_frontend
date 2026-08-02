export interface TeacherGroupStudentStatRow {
  studentId: string;
  fullName: string;
  starsBySubject: Record<string, number>;
}

export interface TeacherGroupStats {
  groupId: string;
  groupName: string;
  groupCode: string;
  gradingMethod?: 'sum' | 'average';
  subjectTitles: string[];
  students: TeacherGroupStudentStatRow[];
  /** Підписи осі X (останні місяці), з БД по датах оцінок. */
  chartMonthLabels?: string[];
  /** Ряд для графіка по місяцях (sum — кумулятив, average — running mean). */
  starsBySubjectChartSeries?: Record<string, number[]>;
}
