# Education Frontend (Angular + Tailwind)

Frontend платформи освіти: Angular 19, Tailwind CSS, feature-based архітектура.

## Структура проекту

```
src/app
├── core                 # Глобальні сервіси, guards, interceptors, models
├── shared               # Переиспользуемые компоненти, pipes, directives, utils
├── features             # Модулі за фічами (auth, dashboard, students, teachers, schools, analytics)
├── layout               # Sidebar, Navbar, Footer, MainLayout
├── app.routes.ts
└── app.config.ts
```

## Ролі (JWT + Spring Security)

- `SUPER_ADMIN`
- `ADMIN_SCHOOL`
- `TEACHER`
- `STUDENT`

## Запуск

```bash
npm install
npm start
```

Збірка для production:

```bash
npm run build
```

## Рекомендації для production

- **Backend**: education-backend (Java Spring Boot) в окремому репозиторії
- **Deploy**: Frontend → S3 + CloudFront, Backend → Docker на EC2/ECS, DB → MongoDB Atlas
- **CI/CD**: GitHub Actions (build → Docker → deploy)
- **Design system**: можна винести в `libs/design-system` або `libs/ui-components` для переиспользования UI

## Додаткові інструменти

- ESLint, Prettier (вже в проекті)
- NgRx — при складному state
- Angular Signals — використовуються в AuthService
