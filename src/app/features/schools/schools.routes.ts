import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SCHOOLS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/schools-list/schools-list.component').then(
        (m) => m.SchoolsListComponent
      ),
    canActivate: [authGuard],
  },
];
