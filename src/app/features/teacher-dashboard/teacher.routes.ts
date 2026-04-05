import { Routes } from '@angular/router';

const loadPage = () =>
  import('./pages/teacher-dashboard-page/teacher-dashboard-page.component').then(
    (m) => m.TeacherDashboardPageComponent
  );

export const TEACHER_DASHBOARD_ROUTES: Routes = [
  { path: '', loadComponent: loadPage },
  { path: 'groups', loadComponent: loadPage },
  { path: 'students', loadComponent: loadPage },
  { path: 'activity', loadComponent: loadPage },
  { path: 'group-stats', loadComponent: loadPage },
];
