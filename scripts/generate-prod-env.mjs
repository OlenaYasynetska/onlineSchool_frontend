/**
 * Генерує src/environments/environment.prod.generated.ts зі змінних оточення (при npm run build).
 * Підхоплює кореневий .env у каталозі frontend (якщо є).
 *
 * Змінні:
 *   NG_APP_API_URL              — базовий URL API (production: зазвичай '/api')
 *   ENABLE_LOCAL_SUPER_ADMIN  — 'true' щоб увімкнути локальний вхід суперадміна без бекенду (за замовчуванням false)
 *   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD — обовʼязкові, якщо ENABLE_LOCAL_SUPER_ADMIN=true (інакше збірка завершиться з помилкою)
 *
 * Прямий виклик ng build без npm не виконає цей скрипт — використовуйте npm run build.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envFile = path.join(root, '.env');

function loadDotEnv() {
  if (!fs.existsSync(envFile)) return;
  const text = fs.readFileSync(envFile, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnv();

const apiUrl = process.env.NG_APP_API_URL ?? '/api';

const enableLocal =
  String(process.env.ENABLE_LOCAL_SUPER_ADMIN ?? '')
    .toLowerCase()
    .trim() === 'true';

let superAdminEmail = '';
let superAdminPassword = '';

if (enableLocal) {
  superAdminEmail = (process.env.SUPER_ADMIN_EMAIL ?? '').trim();
  superAdminPassword = (process.env.SUPER_ADMIN_PASSWORD ?? '').trim();
  if (!superAdminEmail || !superAdminPassword) {
    console.error(
      'ENABLE_LOCAL_SUPER_ADMIN=true потребує непорожніх SUPER_ADMIN_EMAIL і SUPER_ADMIN_PASSWORD (наприклад у .env або в змінних Vercel).'
    );
    process.exit(1);
  }
}

const out = `/* Автогенерація: scripts/generate-prod-env.mjs — не редагувати вручну */
import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: true,
  apiUrl: ${JSON.stringify(apiUrl)},
  enableLocalSuperAdminLogin: ${enableLocal ? 'true' : 'false'},
  superAdminEmail: ${JSON.stringify(superAdminEmail)},
  superAdminPassword: ${JSON.stringify(superAdminPassword)},
};
`;

const target = path.join(root, 'src/environments/environment.prod.generated.ts');
fs.writeFileSync(target, out, 'utf8');
console.log('Wrote', path.relative(root, target));
console.log(
  '  enableLocalSuperAdminLogin:',
  enableLocal ? 'true (override via ENABLE_LOCAL_SUPER_ADMIN)' : 'false (use DB user + /auth/login)'
);
