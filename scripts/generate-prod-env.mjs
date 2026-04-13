/**
 * Генерує src/environments/environment.prod.generated.ts зі змінних оточення (при npm run build).
 * Підхоплює кореневий .env у каталозі frontend (якщо є).
 *
 * Змінні:
 *   NG_APP_API_URL              — базовий URL API (краще повний https://…/api; див. Vercel нижче)
 *   NG_APP_BACKEND_URL          — опційно: повний URL API на Vercel, якщо не заданий NG_APP_API_URL як https
 *   NG_APP_USE_RELATIVE_API=1    — на Vercel не підставляти прямий Railway URL (лише якщо знаєш, що робиш)
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

/**
 * У Vercel інколи задають порожній рядок — тоді `?? '/api'` не спрацьовує, і в збірку потрапляє "",
 * а запити йдуть на `/auth/login` (SPA) замість `/api/auth/login` → 405.
 * Абсолютний URL без суфікса `/api` також ламає шляхи до Spring.
 */
function normalizeApiUrl(raw) {
  let u = (raw ?? '').trim();
  if (!u) return '/api';
  u = u.replace(/\/$/, '');
  if (u.startsWith('http://') || u.startsWith('https://')) {
    if (!/\/api$/i.test(u)) return `${u}/api`;
    return u;
  }
  if (u.startsWith('/')) {
    if (u === '/api' || u.startsWith('/api/')) return u;
    return '/api';
  }
  return '/api';
}

/** Продакшен Railway; запити напряму з браузера обходять Vercel rewrite (POST інколи → 405). */
const DEFAULT_RAILWAY_API =
  (process.env.NG_APP_BACKEND_URL ?? '').trim() ||
  'https://onlineschoolbackend-production.up.railway.app/api';

let apiUrl = normalizeApiUrl(process.env.NG_APP_API_URL);

const forceRelativeApi =
  String(process.env.NG_APP_USE_RELATIVE_API ?? '')
    .trim() === '1';
/** На збірці Vercel зазвичай VERCEL=1 і/або VERCEL_ENV=preview|production. Рідко лишається лише VERCEL_ENV — тоді старий код лишав /api → 405 на прев’ю з Deployment Protection. */
const vercelEnv = String(process.env.VERCEL_ENV ?? '').trim();
const buildingOnVercel =
  process.env.VERCEL === '1' ||
  process.env.VERCEL === 'true' ||
  ['preview', 'production', 'development'].includes(vercelEnv);

if (buildingOnVercel && forceRelativeApi) {
  console.warn(
    '  Vercel: NG_APP_USE_RELATIVE_API=1 — API йде через /api на домені Vercel. Якщо увімкнено Deployment Protection, POST до /api може дати 405. Краще прибрати цю змінну або задати NG_APP_API_URL=https://…/api'
  );
}

if (
  buildingOnVercel &&
  !forceRelativeApi &&
  !apiUrl.startsWith('http://') &&
  !apiUrl.startsWith('https://')
) {
  apiUrl = DEFAULT_RAILWAY_API;
  console.log(
    '  Vercel: apiUrl → absolute backend (browser calls Railway directly; avoids POST 405 / auth wall on /api). Override: NG_APP_API_URL=https://…/api'
  );
}

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
console.log('  apiUrl:', apiUrl);
console.log(
  '  enableLocalSuperAdminLogin:',
  enableLocal ? 'true (override via ENABLE_LOCAL_SUPER_ADMIN)' : 'false (use DB user + /auth/login)'
);
