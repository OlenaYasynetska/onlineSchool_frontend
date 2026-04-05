/**
 * UUID школи з сесії / API іноді приходить не як string (наприклад після ручного JSON).
 * Без цього `schoolId?.trim()` у модалках дає undefined і форма «мовчки» ламається.
 */
export function normalizeSchoolId(raw: unknown): string {
  if (raw == null) return '';
  return String(raw).trim();
}

/** Після логіну / успішного dashboard — щоб модалки мали id, навіть якщо `auth_user` без schoolId. */
export const SESSION_STORAGE_SCHOOL_ID_KEY = 'school_admin_active_school_id';
