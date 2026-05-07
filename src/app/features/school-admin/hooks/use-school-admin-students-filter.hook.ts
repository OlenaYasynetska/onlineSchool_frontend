import type {
  SchoolGroupCard,
  StudentRow,
} from '../models/school-admin-dashboard.model';

function datePart(iso: string | undefined): string {
  const s = (iso ?? '').trim();
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export type SchoolAdminStudentsFilterContext = {
  students: StudentRow[];
  groups?: SchoolGroupCard[];
};

/**
 * Таблиця Students: сортування за датою вступу + пошук, фільтр групи, діапазон дат.
 */
export function useSchoolAdminStudentsFilter(
  getContext: () => SchoolAdminStudentsFilterContext,
) {
  let searchQuery = '';
  let groupName = '';
  let joinedFrom = '';
  let joinedTo = '';

  function onStudentSearchInput(event: Event): void {
    searchQuery = (event.target as HTMLInputElement).value ?? '';
  }

  function onGroupFilterChange(event: Event): void {
    groupName = (event.target as HTMLSelectElement).value ?? '';
  }

  function onJoinedFromInput(event: Event): void {
    joinedFrom = (event.target as HTMLInputElement).value ?? '';
  }

  function onJoinedToInput(event: Event): void {
    joinedTo = (event.target as HTMLInputElement).value ?? '';
  }

  let cachedList: StudentRow[] = [];
  let lastStudentsRef: StudentRow[] | null = null;
  let lastSearch = '';
  let lastGroup = '';
  let lastFrom = '';
  let lastTo = '';

  function computeGroupFilterOptions(): string[] {
    const { students, groups } = getContext();
    const names = new Set<string>();
    for (const g of groups ?? []) {
      const n = g.name?.trim();
      if (n) names.add(n);
    }
    for (const s of students) {
      for (const gn of s.groupNames ?? []) {
        const n = gn?.trim();
        if (n) names.add(n);
      }
    }
    return [...names].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
  }

  function computeFilteredIfNeeded(): StudentRow[] {
    const { students } = getContext();
    const q = searchQuery.trim().toLowerCase();

    if (
      students === lastStudentsRef &&
      q === lastSearch &&
      groupName === lastGroup &&
      joinedFrom === lastFrom &&
      joinedTo === lastTo
    ) {
      return cachedList;
    }

    lastStudentsRef = students;
    lastSearch = q;
    lastGroup = groupName;
    lastFrom = joinedFrom;
    lastTo = joinedTo;

    let list = [...students].sort((a, b) =>
      datePart(a.joinedAt).localeCompare(datePart(b.joinedAt)),
    );

    if (groupName) {
      list = list.filter((s) => (s.groupNames ?? []).includes(groupName));
    }

    if (joinedFrom.trim()) {
      const from = joinedFrom.trim();
      list = list.filter((s) => datePart(s.joinedAt) >= from);
    }
    if (joinedTo.trim()) {
      const to = joinedTo.trim();
      list = list.filter((s) => datePart(s.joinedAt) <= to);
    }

    if (q) {
      list = list.filter((s) => {
        const hay = [
          s.fullName,
          s.email,
          (s.groupNames ?? []).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }

    cachedList = list;
    return cachedList;
  }

  return {
    onStudentSearchInput,
    onGroupFilterChange,
    onJoinedFromInput,
    onJoinedToInput,
    get groupFilterOptions(): string[] {
      return computeGroupFilterOptions();
    },
    get filteredStudents(): StudentRow[] {
      return computeFilteredIfNeeded();
    },
  };
}
