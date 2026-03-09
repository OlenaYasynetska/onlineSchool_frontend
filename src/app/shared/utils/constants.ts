export const APP_ROUTES = {
  AUTH: 'auth',
  LOGIN: 'auth/login',
  DASHBOARD: 'dashboard',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  SCHOOLS: 'schools',
  ANALYTICS: 'analytics',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_SCHOOL: 'ADMIN_SCHOOL',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;
