import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: (...args: unknown[]) => void;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly measurementId = 'G-XK87PCV3G1';

  constructor() {
    this.init();
  }

  private init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.trackPage(event.urlAfterRedirects);
      });
  }

  trackPage(url: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.measurementId, {
        page_path: url,
      });
    }
  }

  trackEvent(action: string, category: string, label?: string, value?: number): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }
  }
}
