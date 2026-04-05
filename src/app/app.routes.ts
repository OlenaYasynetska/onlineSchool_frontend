import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/pages/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./features/landing/pages/plans/plans-page.component').then(
        (m) => m.PlansPageComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'students',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/students/students.routes').then(
            (m) => m.STUDENTS_ROUTES
          ),
      },
      {
        path: 'teachers',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/teachers/teachers.routes').then(
            (m) => m.TEACHERS_ROUTES
          ),
      },
      {
        path: 'schools',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/schools/schools.routes').then(
            (m) => m.SCHOOLS_ROUTES
          ),
      },
      {
        path: 'teacher',
        canActivate: [authGuard, roleGuard(['TEACHER'])],
        loadChildren: () =>
          import('./features/teacher-dashboard/teacher.routes').then(
            (m) => m.TEACHER_DASHBOARD_ROUTES
          ),
      },
      {
        path: 'student',
        canActivate: [authGuard, roleGuard(['STUDENT'])],
        loadChildren: () =>
          import('./features/student-dashboard/student.routes').then(
            (m) => m.STUDENT_DASHBOARD_ROUTES
          ),
      },
      {
        path: 'school-admin',
        canActivate: [authGuard, roleGuard(['ADMIN_SCHOOL'])],
        loadChildren: () =>
          import('./features/school-admin/school-admin.routes').then(
            (m) => m.SCHOOL_ADMIN_ROUTES
          ),
      },
      {
        path: 'analytics',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then(
            (m) => m.ANALYTICS_ROUTES
          ),
      },
      {
        path: 'super-admin',
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/super-admin/super-admin.routes').then(
            (m) => m.SUPER_ADMIN_ROUTES
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/errors/pages/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
