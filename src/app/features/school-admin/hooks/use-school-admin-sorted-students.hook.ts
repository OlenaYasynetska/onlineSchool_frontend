import type { StudentRow } from '../models/school-admin-dashboard.model';

/**
 * Студенти для таблиці за датою вступу; кеш при незмінному посиланні на масив з dash.
 */
export function useSchoolAdminSortedStudents(
  getStudents: () => StudentRow[] | undefined
) {
  let cachedSorted: StudentRow[] = [];
  let lastSourceRef: StudentRow[] | null = null;

  function computeSortedIfNeeded(): StudentRow[] {
    const raw = getStudents() ?? [];
    if (raw === lastSourceRef) {
      return cachedSorted;
    }
    lastSourceRef = raw;
    cachedSorted = [...raw].sort((a, b) =>
      a.joinedAt.localeCompare(b.joinedAt)
    );
    return cachedSorted;
  }

  return {
    get sortedStudents(): StudentRow[] {
      return computeSortedIfNeeded();
    },
  };
}
