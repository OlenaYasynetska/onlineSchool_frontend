import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dashboardEntryGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();

  if (!user) {
    void router.navigate(['/auth/login']);
    return false;
  }

  if (user.role === 'TEACHER') {
    void router.navigate(['/teacher']);
    return false;
  }

  if (user.role === 'STUDENT') {
    void router.navigate(['/student']);
    return false;
  }

  return true;
};
