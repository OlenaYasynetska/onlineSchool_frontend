# Education Frontend (Angular)

## Українська

Клієнт освітньої платформи: **Angular 19**, **TypeScript 5.6**, **Tailwind CSS 3**, **standalone**-компоненти, **lazy loading** маршрутів, HTTP з **інтерцептором JWT**. Бекенд — **`onlineSchool_backend`** (Spring Boot).

### Стек

| Технологія | Призначення |
|------------|-------------|
| Angular 19 | UI, роутинг, forms, HttpClient |
| Tailwind CSS | стилі (`src/styles/style.css`, PostCSS) |
| RxJS | асинхронні потоки |
| ng-apexcharts + ApexCharts | графіки / аналітика |
| ngx-extended-pdf-viewer | перегляд PDF (навчальні матеріали) |

Інструменти: ESLint (`ng lint`), Prettier, Karma/Jasmine для тестів.

### Структура `src/app`

```
src/app
├── app.component.ts       # Корінь застосунку
├── app.config.ts          # provideRouter, provideHttpClient + auth interceptor
├── app.routes.ts          # Глобальні маршрути
│
├── core/                  # Без фіч: один раз на апку
│   ├── guards/            # auth, role, dashboard-entry
│   ├── interceptors/      # auth (JWT у запитах)
│   ├── models/            # user, school тощо
│   └── services/          # auth, user, study-materials, homework-file, chat-ui
│
├── shared/                # Компоненти / утиліти для кількох фіч
│   ├── components/        # button, card, loader, PDF viewer, schedule grid, тощо
│   ├── charts/            # допоміжні налаштування ApexCharts
│   ├── directives/        # наприклад click-outside
│   ├── hooks/             # layout / preview-хуки (TS-функції)
│   ├── pipes/
│   └── utils/
│
├── layout/                # Оболонки та навігація
│   ├── main-layout/       # Основний макет (sidebar, navbar, outlet)
│   ├── cabinet-shell/     # Оболонка кабінетів teacher / student / school-admin
│   ├── sidebar/, navbar/, footer/
│   └── chat-contacts-panel/   # Бічна панель контактів чату
│
└── features/              # Модулі за доменами (lazy routes там, де є *.routes.ts)
    ├── landing/           # Лендинг, сторінка тарифів
    ├── auth/              # Логін, реєстрація
    ├── errors/            # 404 тощо
    ├── dashboard/         # Спільний dashboard (за authGuard)
    ├── students/, teachers/, schools/
    ├── analytics/
    ├── super-admin/
    ├── school-admin/      # ADMIN_SCHOOL: школа, групи, вчителі, студенти, матеріали, розклад
    ├── teacher-dashboard/ # TEACHER: домашки, групи, розклад, матеріали, чат …
    ├── student-dashboard/ # STUDENT: домашки, розклад, матеріали, чат …
    └── chat/              # Сторінка чату (підключена з teacher/student routes)
```

Деталі сторінок — у файлах `*.routes.ts` у відповідних папках `features/`.

### Маршрути (огляд)

| Шлях | Захист | Зміст |
|------|--------|--------|
| `/` | — | Лендинг |
| `/auth/*` | — | Авторизація |
| `/plans` | — | Тарифи |
| `/dashboard` | `authGuard`, `dashboardEntryGuard` | Загальний dashboard |
| `/students`, `/teachers`, `/schools`, `/analytics` | `authGuard` | Списки та аналітика (ліміт за ролями також на бекенді / у UI) |
| `/teacher/*` | `authGuard` + роль **TEACHER** | Кабінет викладача; чат: `/teacher/chat` |
| `/student/*` | `authGuard` + роль **STUDENT** | Кабінет учня; чат: `/student/chat` |
| `/school-admin/*` | `authGuard` + **ADMIN_SCHOOL** | Адміністрування школи |
| `/super-admin/*` | `authGuard` + **SUPER_ADMIN** | Суперадмін |

404 — через `features/errors`.

### Ролі (узгоджено з Spring Security)

- `SUPER_ADMIN`
- `ADMIN_SCHOOL`
- `TEACHER`
- `STUDENT`

### Локальна розробка

**Вимоги:** Node.js (LTS), npm; запущений бекенд зазвичай на порту **8080**.

```bash
cd onlineSchool_frontend
npm install
npm start
```

- Дев-сервер: `ng serve` з `proxy.conf.json` — перенаправлення **`/api` → `http://localhost:8080`** (зручно, якщо в `apiUrl` використовується відносний шлях).
- Базовий URL API для деву — **`src/environments/environment.ts`** (`apiUrl`, за замовчуванням `http://localhost:8080/api`). Не плутати з production-заміною файлу при `ng build`.

Секрети не комітити: скопіюй **`.env.example`** → **`.env`**. Локальний «обхід» суперадміна без API — у `environment.ts` (`enableLocalSuperAdminLogin`; пароль узгоджуй з бекендом за потреби).

**Тести та лінт**

```bash
npm test
npm run lint
```

**Production-збірка**

```bash
npm run build
```

Перед білдом виконується **`prebuild`** → `scripts/generate-prod-env.mjs` створює **`src/environments/environment.prod.generated.ts`** (у `.gitignore`). Змінні — з **`.env`** і/або CI (**Vercel**). Детальніше: **[`DEPLOY.md`](../DEPLOY.md)**.

### Деплой (коротко)

- Типово фронт на **Vercel** — **`vercel.json`**: `outputDirectory`, rewrites `/api` → бекенд.
- Актуальний URL бекенду в rewrites і/або **`NG_APP_API_URL`** — див. `DEPLOY.md` та `.env.example`.

### Корисні файли

| Файл | Опис |
|------|------|
| `angular.json` | Проєкт `education-frontend`, `fileReplacements` для production |
| `proxy.conf.json` | Проксі `/api` на бекенд під час `ng serve` |
| `vercel.json` | Збірка та rewrites для production |
| `scripts/generate-prod-env.mjs` | Генерація prod environment з env-змінних |

---

## English

Client for the education platform: **Angular 19**, **TypeScript 5.6**, **Tailwind CSS 3**, **standalone** components, **lazy-loaded** routes, and an **HTTP JWT interceptor**. Backend: **`onlineSchool_backend`** (Spring Boot).

### Stack

| Technology | Purpose |
|------------|---------|
| Angular 19 | UI, routing, forms, HttpClient |
| Tailwind CSS | styling (`src/styles/style.css`, PostCSS) |
| RxJS | async streams |
| ng-apexcharts + ApexCharts | charts / analytics |
| ngx-extended-pdf-viewer | PDF viewing (study materials) |

Tooling: ESLint (`ng lint`), Prettier, Karma/Jasmine for tests.

### `src/app` structure

```
src/app
├── app.component.ts       # App root
├── app.config.ts          # provideRouter, provideHttpClient + auth interceptor
├── app.routes.ts          # Top-level routes
│
├── core/                  # App-wide, feature-agnostic
│   ├── guards/            # auth, role, dashboard-entry
│   ├── interceptors/      # auth (JWT on requests)
│   ├── models/            # user, school, etc.
│   └── services/          # auth, user, study-materials, homework-file, chat-ui
│
├── shared/                # Shared across features
│   ├── components/        # button, card, loader, PDF viewer, schedule grid, etc.
│   ├── charts/            # ApexCharts helpers
│   ├── directives/        # e.g. click-outside
│   ├── hooks/             # layout / preview helpers (TS functions)
│   ├── pipes/
│   └── utils/
│
├── layout/                # Shells and navigation
│   ├── main-layout/       # Main shell (sidebar, navbar, outlet)
│   ├── cabinet-shell/     # Teacher / student / school-admin cabinet shell
│   ├── sidebar/, navbar/, footer/
│   └── chat-contacts-panel/   # Chat contacts side panel
│
└── features/              # Domain areas (lazy routes where *.routes.ts exists)
    ├── landing/           # Landing, pricing page
    ├── auth/              # Login, registration
    ├── errors/            # 404, etc.
    ├── dashboard/         # Shared dashboard (authGuard)
    ├── students/, teachers/, schools/
    ├── analytics/
    ├── super-admin/
    ├── school-admin/      # ADMIN_SCHOOL: school, groups, teachers, students, materials, schedule
    ├── teacher-dashboard/ # TEACHER: homework, groups, schedule, materials, chat …
    ├── student-dashboard/ # STUDENT: homework, schedule, materials, chat …
    └── chat/              # Chat page (wired from teacher/student routes)
```

See `*.routes.ts` under each `features/` folder for exact pages and child paths.

### Routes (overview)

| Path | Protection | Content |
|------|------------|---------|
| `/` | — | Landing |
| `/auth/*` | — | Authentication |
| `/plans` | — | Plans / pricing |
| `/dashboard` | `authGuard`, `dashboardEntryGuard` | Main dashboard |
| `/students`, `/teachers`, `/schools`, `/analytics` | `authGuard` | Lists and analytics (role limits also enforced by API / UI) |
| `/teacher/*` | `authGuard` + **TEACHER** | Teacher area; chat: `/teacher/chat` |
| `/student/*` | `authGuard` + **STUDENT** | Student area; chat: `/student/chat` |
| `/school-admin/*` | `authGuard` + **ADMIN_SCHOOL** | School administration |
| `/super-admin/*` | `authGuard` + **SUPER_ADMIN** | Super admin |

404 is handled under `features/errors`.

### Roles (aligned with Spring Security)

- `SUPER_ADMIN`
- `ADMIN_SCHOOL`
- `TEACHER`
- `STUDENT`

### Local development

**Requirements:** Node.js (LTS), npm; backend usually on port **8080**.

```bash
cd onlineSchool_frontend
npm install
npm start
```

- Dev server: `ng serve` uses `proxy.conf.json` — **`/api` → `http://localhost:8080`** (useful when `apiUrl` is a relative `/api` path).
- Dev API base URL: **`src/environments/environment.ts`** → `apiUrl` (default `http://localhost:8080/api`). Do not confuse with the production file swap during `ng build`.

Do not commit secrets: copy **`.env.example`** → **`.env`**. Optional local super-admin bypass without API: `environment.ts` (`enableLocalSuperAdminLogin`; keep password in sync with the backend if needed).

**Tests and lint**

```bash
npm test
npm run lint
```

**Production build**

```bash
npm run build
```

**`prebuild`** runs first → `scripts/generate-prod-env.mjs` generates **`src/environments/environment.prod.generated.ts`** (gitignored). Variables come from **`.env`** and/or CI (**Vercel**). Details: **[`DEPLOY.md`](../DEPLOY.md)**.

### Deployment (short)

- Frontend is typically hosted on **Vercel** — see **`vercel.json`**: `outputDirectory`, `/api` rewrites to the backend.
- Point rewrites and/or **`NG_APP_API_URL`** at your live backend per **`DEPLOY.md`** and **`.env.example`**.

### Useful files

| File | Description |
|------|-------------|
| `angular.json` | `education-frontend` project, production `fileReplacements` |
| `proxy.conf.json` | Proxies `/api` to the backend during `ng serve` |
| `vercel.json` | Build output and production rewrites |
| `scripts/generate-prod-env.mjs` | Builds prod environment from env vars |
