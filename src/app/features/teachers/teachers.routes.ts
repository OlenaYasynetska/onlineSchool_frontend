import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TEACHERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/teachers-list/teachers-list.component').then(
        (m) => m.TeachersListComponent
      ),
    canActivate: [authGuard],
  },
];
