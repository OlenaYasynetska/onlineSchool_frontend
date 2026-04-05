import { Routes } from '@angular/router';

const loadShell = () =>
  import('../../layout/cabinet-shell/cabinet-shell.component').then(
    (m) => m.CabinetShellComponent
  );

const loadSchoolAdminPage = () =>
  import('./pages/school-admin-page/school-admin-page.component').then(
    (m) => m.SchoolAdminPageComponent
  );

/** Вкладені маршрути: при зміні сегмента контент перестворюється (як у super admin). */
export const SCHOOL_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: loadShell,
    children: [
      { path: '', loadComponent: loadSchoolAdminPage },
      { path: 'groups', loadComponent: loadSchoolAdminPage },
      { path: 'employees', loadComponent: loadSchoolAdminPage },
      { path: 'teachers', loadComponent: loadSchoolAdminPage },
      { path: 'students', loadComponent: loadSchoolAdminPage },
    ],
  },
];

