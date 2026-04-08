export interface TeacherOptionShort {
  id: string;
  displayName: string;
}

export interface StudentGroupOption {
  id: string;
  name: string;
  code: string;
}

export interface SubjectStarTotalRow {
  subject: string;
  starsTotal: number;
}

export interface StarRewardLogDto {
  gradedAt: string;
  teacherName: string;
  subject: string;
  stars: number;
  feedback: string | null;
}

/** GET /student/homework/dashboard-context */
export interface StudentDashboardContextDto {
  schoolName: string;
  groups: StudentGroupOption[];
}

/** Відповідь GET /student/homework/my-stars — зірки з оцінених ДЗ у БД. */
export interface StudentMyStarsDto {
  totalStars: number;
  weekGain: number;
  monthGain: number;
  subjectTotals: SubjectStarTotalRow[];
  chartMonthLabels: string[];
  starsBySubjectChartSeries: Record<string, number[]>;
  rewardLog: StarRewardLogDto[];
}

export interface HomeworkSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  subjectTitle: string;
  messageText: string | null;
  fileName: string;
  status: string;
  stars: number | null;
  teacherFeedback: string | null;
  groupName: string | null;
  submittedAt: string;
  gradedAt: string | null;
}
