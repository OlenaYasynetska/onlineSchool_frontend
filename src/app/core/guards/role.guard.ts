import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { UserRole } from '../models';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();
    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }
    if (allowedRoles.includes(user.role)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
}
