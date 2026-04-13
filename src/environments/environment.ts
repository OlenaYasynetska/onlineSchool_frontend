import type { AppEnvironment } from './environment.types';

/**
 * Локальна розробка (`npm start` / `ng serve`).
 * Увага: змінні з файлу `.env` тут НЕ підставляються — лише `npm run build` (див. scripts/generate-prod-env.mjs).
 * Пароль суперадміна для обходу API має збігатися з тим, що ви вводите у формі; зручно тримати той самий рядок,
 * що й `SUPER_ADMIN_PASSWORD` у Spring — тоді спрацює і обхід без БД, і логін через API після bootstrap.
 */
export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableLocalSuperAdminLogin: true,
  superAdminEmail: 'superadmin@education.local',
  superAdminPassword: 'SuperAdmin!ChangeMe',
};
