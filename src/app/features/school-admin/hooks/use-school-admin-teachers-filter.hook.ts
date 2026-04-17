import type { SchoolTeacher } from '../models/school-admin-dashboard.model';

/**
 * Пошук по таблиці Teachers (як у useSchoolAdminGroups для груп).
 * Кешує результат, поки не змінилися query або посилання на масив учителів.
 */
export function useSchoolAdminTeachersFilter(
  getTeachers: () => SchoolTeacher[]
) {
  let teacherSearchQuery = '';

  function onTeacherSearchInput(event: Event): void {
    teacherSearchQuery = (event.target as HTMLInputElement).value ?? '';
  }

  let cachedFiltered: SchoolTeacher[] = [];
  let lastQuery = '';
  let lastTeachersRef: SchoolTeacher[] | null = null;

  function computeFilteredIfNeeded(): SchoolTeacher[] {
    const list = getTeachers();
    const q = teacherSearchQuery.trim().toLowerCase();

    if (q === lastQuery && list === lastTeachersRef) {
      return cachedFiltered;
    }

    if (!q) {
      cachedFiltered = list;
    } else {
      cachedFiltered = list.filter((t) => {
        const hay = [
          t.displayName,
          t.email ?? '',
          t.phone ?? '',
          t.subjectTitles.join(' '),
          t.groupNames.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }

    lastQuery = q;
    lastTeachersRef = list;
    return cachedFiltered;
  }

  return {
    onTeacherSearchInput,
    get filteredTeachers(): SchoolTeacher[] {
      return computeFilteredIfNeeded();
    },
  };
}
