export interface StudentRow {
  /** UUID у БД; у таблиці показуємо порядковий № окремо. */
  id: string;
  fullName: string;
  email: string;
  joinedAt: string;
  /** Групи / курси, до яких зараховано студента після додавання. */
  groupNames?: string[];
}

export interface PaymentHistoryRow {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: 'Paid' | 'Pending payment' | 'Failed';
}

export interface SchoolDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalSubjects: number;
  totalPayments: number;
  paidPayments: number;
  totalReceived: string;
}

/** Предмет школи (`school_subjects`). */
export interface SchoolSubject {
  id: string;
  title: string;
}

/** Викладач школи (`teachers` + ім'я з `users`). */
export interface SchoolTeacher {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  subjectTitles: string[];
  /** `school_subjects.id` for subjects assigned to this teacher (from API). */
  subjectIds?: string[];
  groupNames: string[];
  /** Після POST створення викладача. */
  inviteEmailSent?: boolean;
}

export interface SchoolGroupCard {
  id: string;
  name: string;
  code: string;
  /** Якщо група прив'язана до предмета з БД */
  subjectId?: string | null;
  /** Якщо група прив'язана до викладача з БД */
  teacherId?: string | null;
  /** ПІБ викладача з users (якщо є teacher_id). */
  teacherDisplayName?: string | null;
  topicsLabel: string;
  /** Якщо false — рядок предмету/програми не показується на картці (дані в БД лишаються). */
  showSubjectOnCard?: boolean;
  startDate: string;
  endDate: string;
  studentsCount: number;
  /** Сумарні зірки за ДЗ усіх учнів групи. */
  homeworkStarsTotal: number;
  active: boolean;
}

export interface SchoolSubscriptionInfo {
  /** Назва тарифу з БД (subscription_plans.title) */
  planTitle: string;
  /** Кінець періоду доступу: дата наступного платежу / доступу (dd.MM.yyyy) */
  platformAccessEndDate: string;
}

export interface SchoolAdminDashboardResponse {
  /** З `GET /school-admin/dashboard` — той самий `schoolId`, що в query. */
  schoolId?: string;
  stats: SchoolDashboardStats;
  students: StudentRow[];
  payments: PaymentHistoryRow[];
  /** З бекенду `/school-admin/dashboard`; якщо немає — сайдбар покаже «—». */
  subscription?: SchoolSubscriptionInfo;
  /** Групи з таблиці `school_groups` */
  groups?: SchoolGroupCard[];
}

