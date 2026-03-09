import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/analytics-page/analytics-page.component').then(
        (m) => m.AnalyticsPageComponent
      ),
    canActivate: [authGuard],
  },
];
