/* Автогенерація: scripts/generate-prod-env.mjs — не редагувати вручну */
import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: true,
  apiUrl: "/api",
  enableLocalSuperAdminLogin: false,
  superAdminEmail: "superadmin@education.local",
  superAdminPassword: "SuperAdmin!ChangeMe",
};
