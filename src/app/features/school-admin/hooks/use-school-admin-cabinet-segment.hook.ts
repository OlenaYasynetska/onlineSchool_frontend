import { inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Перший сегмент після `/school-admin` — `''` означає головний огляд.
 * Синхронізується з Router (NavigationEnd) і при ініціалізації.
 */
export function useSchoolAdminCabinetSegment() {
  const router = inject(Router);
  const cabinetSegment = signal<string>('');

  function syncCabinetSegment(): void {
    const url = router.url.split('?')[0].split('#')[0];
    if (!url.startsWith('/school-admin')) {
      cabinetSegment.set('');
      return;
    }
    const rest = url.slice('/school-admin'.length).replace(/^\//, '');
    cabinetSegment.set((rest.split('/')[0] ?? '').trim());
  }

  router.events
    .pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    )
    .subscribe(() => syncCabinetSegment());

  syncCabinetSegment();

  return { cabinetSegment, syncCabinetSegment };
}
