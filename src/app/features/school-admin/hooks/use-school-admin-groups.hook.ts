import type {
  SchoolAdminDashboardResponse,
  SchoolGroupCard,
} from '../models/school-admin-dashboard.model';

/**
 * VM для секции Groups: поиск + фильтрация по dash.groups.
 * Реальную отрисовку делает Angular, а при каждом событии и перерендере
 * getter `filteredGroups` пересчитывается.
 */
export function useSchoolAdminGroups(dash: SchoolAdminDashboardResponse) {
  let groupSearchQuery = '';

  function onGroupSearchInput(event: Event): void {
    groupSearchQuery = (event.target as HTMLInputElement).value;
  }

  // Кэшируем результат, чтобы не пересчитывать фильтр на каждом change detection,
  // когда query и ссылка на dash.groups не менялись.
  let cachedFilteredGroups: SchoolGroupCard[] = dash.groups ?? [];
  let lastQuery = '';
  let lastGroupsRef: SchoolGroupCard[] | null = null;

  function computeFilteredGroupsIfNeeded(): SchoolGroupCard[] {
    const list = dash.groups ?? [];
    const q = groupSearchQuery.trim().toLowerCase();

    if (q === lastQuery && list === lastGroupsRef) {
      return cachedFilteredGroups;
    }

    if (!q) {
      cachedFilteredGroups = list;
    } else {
      cachedFilteredGroups = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.code.toLowerCase().includes(q) ||
          g.topicsLabel.toLowerCase().includes(q),
      );
    }

    lastQuery = q;
    lastGroupsRef = list;
    return cachedFilteredGroups;
  }

  return {
    onGroupSearchInput,
    get filteredGroups(): SchoolGroupCard[] {
      return computeFilteredGroupsIfNeeded();
    },
  };
}

