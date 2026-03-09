import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/students-list/students-list.component').then(
        (m) => m.StudentsListComponent
      ),
    canActivate: [authGuard],
  },
];
