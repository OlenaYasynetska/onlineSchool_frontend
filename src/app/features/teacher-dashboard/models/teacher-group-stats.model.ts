export interface TeacherGroupStudentStatRow {
  studentId: string;
  fullName: string;
  starsBySubject: Record<string, number>;
}

export interface TeacherGroupStats {
  groupId: string;
  groupName: string;
  groupCode: string;
  subjectTitles: string[];
  students: TeacherGroupStudentStatRow[];
  /** Підписи осі X (останні місяці), з БД по датах оцінок. */
  chartMonthLabels?: string[];
  /** Кумулятивні зірки по місяцях для кожного предмета (ключ — назва як у subjectTitles). */
  starsBySubjectChartSeries?: Record<string, number[]>;
}
