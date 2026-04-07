import type {
  SchoolAdminDashboardResponse,
  SchoolGroupCard,
  StudentRow,
} from '../models/school-admin-dashboard.model';

/**
 * Скільки учнів у групі з назвою `groupName` за полем groupNames у ростері
 * (відповідає зарахуванням у БД у відповіді GET teacher/school-admin dashboard).
 */
export function countStudentsInGroupForRoster(
  groupName: string,
  students: StudentRow[]
): number {
  const n = groupName.trim().toLowerCase();
  if (!n) return 0;
  return students.filter((s) =>
    (s.groupNames ?? []).some((g) => g.trim().toLowerCase() === n)
  ).length;
}

/** Оновлює studentsCount на картках груп за таблицею учнів (узгодження з БД через API). */
export function syncGroupCardsStudentsCountFromRoster(
  groups: SchoolGroupCard[],
  students: StudentRow[]
): SchoolGroupCard[] {
  return groups.map((g) => ({
    ...g,
    studentsCount: countStudentsInGroupForRoster(g.name, students),
  }));
}

/** Після Object.assign(dash, data) або локальних змін students/groups. */
export function syncGroupCountsInDashboard(dash: SchoolAdminDashboardResponse): void {
  if (!dash.groups?.length || !dash.students) {
    return;
  }
  dash.groups = syncGroupCardsStudentsCountFromRoster(dash.groups, dash.students);
}
