import { Routes } from '@angular/router';

const loadShell = () =>
  import('../../layout/cabinet-shell/cabinet-shell.component').then(
    (m) => m.CabinetShellComponent
  );

const loadPage = () =>
  import('./pages/teacher-dashboard-page/teacher-dashboard-page.component').then(
    (m) => m.TeacherDashboardPageComponent
  );

const loadGroupDetail = () =>
  import(
    './pages/teacher-group-detail-page/teacher-group-detail-page.component'
  ).then((m) => m.TeacherGroupDetailPageComponent);

const loadHomework = () =>
  import('./pages/teacher-homework-page/teacher-homework-page.component').then(
    (m) => m.TeacherHomeworkPageComponent
  );

const loadGroupStats = () =>
  import('./pages/teacher-group-stats-page/teacher-group-stats-page.component').then(
    (m) => m.TeacherGroupStatsPageComponent
  );

export const TEACHER_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: loadShell,
    children: [
      { path: '', loadComponent: loadPage },
      { path: 'groups/:groupId', loadComponent: loadGroupDetail },
      { path: 'groups', loadComponent: loadPage },
      { path: 'students', loadComponent: loadPage },
      { path: 'homework', loadComponent: loadHomework },
      { path: 'activity', loadComponent: loadPage },
      { path: 'group-stats', loadComponent: loadGroupStats },
    ],
  },
];
