import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'students',
        loadChildren: () =>
          import('./features/students/students.routes').then(
            (m) => m.STUDENTS_ROUTES
          ),
      },
      {
        path: 'teachers',
        loadChildren: () =>
          import('./features/teachers/teachers.routes').then(
            (m) => m.TEACHERS_ROUTES
          ),
      },
      {
        path: 'schools',
        loadChildren: () =>
          import('./features/schools/schools.routes').then(
            (m) => m.SCHOOLS_ROUTES
          ),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then(
            (m) => m.ANALYTICS_ROUTES
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
