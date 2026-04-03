import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: 'organizations/:organizationId/edit',
    loadComponent: () =>
      import(
        './pages/super-admin-organization-page/super-admin-organization-page.component'
      ).then((m) => m.SuperAdminOrganizationPageComponent),
  },
  {
    path: 'organizations/:organizationId',
    loadComponent: () =>
      import(
        './pages/super-admin-organization-page/super-admin-organization-page.component'
      ).then((m) => m.SuperAdminOrganizationPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/super-admin-page/super-admin-page.component').then(
        (m) => m.SuperAdminPageComponent
      ),
  },
  {
    path: 'subscribers',
    loadComponent: () =>
      import('./pages/super-admin-subscribers/super-admin-subscribers.component').then(
        (m) => m.SuperAdminSubscribersComponent
      ),
  },
  {
    path: 'administrators',
    loadComponent: () =>
      import('./pages/super-admin-administrators/super-admin-administrators.component').then(
        (m) => m.SuperAdminAdministratorsComponent
      ),
  },
];
