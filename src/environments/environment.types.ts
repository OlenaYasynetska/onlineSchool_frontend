/**
 * Єдиний опис полів environment (dev + production build).
 */
export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  /**
   * Локальний вхід суперадміна без бекенду (лише для dev/stage).
   * У production збірці за замовчуванням false — використовуйте /auth/login з користувачем SUPER_ADMIN у БД.
   */
  enableLocalSuperAdminLogin: boolean;
  /** Мають сенс лише якщо enableLocalSuperAdminLogin === true */
  superAdminEmail: string;
  superAdminPassword: string;
}
