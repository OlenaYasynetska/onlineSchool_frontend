import { Routes } from '@angular/router';

const loadSchoolAdminPage = () =>
  import('./pages/school-admin-page/school-admin-page.component').then(
    (m) => m.SchoolAdminPageComponent
  );

export const SCHOOL_ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: loadSchoolAdminPage },
  { path: 'groups', loadComponent: loadSchoolAdminPage },
  { path: 'employees', loadComponent: loadSchoolAdminPage },
  { path: 'teachers', loadComponent: loadSchoolAdminPage },
  { path: 'students', loadComponent: loadSchoolAdminPage },
];

