import type { AppEnvironment } from './environment.types';

/**
 * Локальна розробка. Реальний пароль не варто комітити в Git — змініть лише у себе локально
 * або вимкніть локальний суперадмін і користуйтеся /auth/login.
 */
export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableLocalSuperAdminLogin: true,
  superAdminEmail: 'superadmin@education.local',
  superAdminPassword: 'LocalDevOnlyChangeMe',
};
