import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { LandingHeroHeaderComponent } from './features/landing/components/landing-hero-header/landing-hero-header.component';
import type { LandingHeaderLayout } from './features/landing/components/landing-hero-header/landing-hero-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingHeroHeaderComponent],
  host: {
    class: 'flex h-full min-h-0 flex-col',
  },
  template: `
    <div [ngClass]="headerStripClass()">
      <div class="w-full px-6 py-4 md:px-10">
        <app-landing-hero-header [brand]="brand" [layout]="headerLayout()" />
      </div>
    </div>
    <div class="flex min-h-0 flex-1 flex-col">
      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  readonly brand = 'Owl Tracker';

  constructor(private readonly router: Router) {}

  headerLayout(): LandingHeaderLayout {
    const path = this.router.url.split('?')[0];
    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/school-admin') ||
      path.startsWith('/students') ||
      path.startsWith('/teachers') ||
      path.startsWith('/schools') ||
      path.startsWith('/analytics') ||
      path.startsWith('/super-admin')
    ) {
      return 'app';
    }
    return 'marketing';
  }

  headerStripClass(): string {
    // Той самий градієнт, що на головній (hero / marketing strip).
    return 'shrink-0 border-b border-white/30 bg-gradient-to-br from-[#FF7A18] via-[#FFC857] to-[#FFF1B8] bg-fixed';
  }
}
