import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import type { FooterVariant } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, FooterComponent],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
  },
  template: `
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <app-sidebar *ngIf="shouldShowSidebar()" />
      <main
        class="flex min-h-0 min-w-0 flex-1 flex-col"
        [class.overflow-y-auto]="shouldShowSidebar()"
        [class.overflow-hidden]="!shouldShowSidebar()"
        [class.p-6]="shouldShowSidebar()"
      >
        <router-outlet />
      </main>
    </div>
    <div class="w-full min-w-0 shrink-0">
      <app-footer />
    </div>
  `,
})
export class MainLayoutComponent {
  constructor(private readonly router: Router) {}

  footerVariant(): FooterVariant {
    return this.router.url.split('?')[0].startsWith('/super-admin')
      ? 'detailed'
      : 'simple';
  }

  shouldShowSidebar(): boolean {
    const url = this.router.url;
    return (
      url.startsWith('/dashboard') ||
      url.startsWith('/students') ||
      url.startsWith('/teachers') ||
      url.startsWith('/schools') ||
      url.startsWith('/analytics') ||
      url.startsWith('/super-admin')
    );
  }
}
