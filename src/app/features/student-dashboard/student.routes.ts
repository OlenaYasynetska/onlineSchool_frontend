import { Routes } from '@angular/router';

const loadShell = () =>
  import('../../layout/cabinet-shell/cabinet-shell.component').then(
    (m) => m.CabinetShellComponent
  );

const loadPage = () =>
  import('./pages/student-dashboard-page/student-dashboard-page.component').then(
    (m) => m.StudentDashboardPageComponent
  );

const loadHomework = () =>
  import('./pages/student-homework-page/student-homework-page.component').then(
    (m) => m.StudentHomeworkPageComponent
  );

const loadStudentSchedulePage = () =>
  import('./pages/student-schedule-page/student-schedule-page.component').then(
    (m) => m.StudentSchedulePageComponent
  );

export const STUDENT_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: loadShell,
    children: [
      { path: '', loadComponent: loadPage },
      { path: 'group-stats', loadComponent: loadPage },
      { path: 'groups', loadComponent: loadPage },
      { path: 'schedule', loadComponent: loadStudentSchedulePage },
      { path: 'homework', loadComponent: loadHomework },
    ],
  },
];
