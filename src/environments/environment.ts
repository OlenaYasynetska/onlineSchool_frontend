import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableLocalSuperAdminLogin: true,
  superAdminEmail: 'superadmin@education.local',
  superAdminPassword: 'SuperAdmin!ChangeMe',
};
