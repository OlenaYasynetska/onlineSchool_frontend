import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

export type LandingHeaderLayout = 'marketing' | 'app';

@Component({
  selector: 'app-landing-hero-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (layout === 'marketing') {
      <header class="mb-0 flex flex-wrap items-center justify-between gap-3">
        <a
          routerLink="/"
          class="flex min-w-0 items-center gap-3 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-900/30"
        >
          <div
            class="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full bg-white shadow-md"
          >
            <img
              src="/assets/icons/owl_icon.png"
              alt="Owl icon"
              class="h-full w-full rounded-full object-cover"
            />
          </div>
          <span class="text-lg font-semibold text-slate-900">{{ brand }}</span>
        </a>

        <div
          class="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3 md:w-auto"
        >
          <a
            routerLink="/auth/login"
            class="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
          >
            Log in
          </a>
          <a
            routerLink="/auth/register"
            class="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
          >
            Sign up
          </a>
          <button
            type="button"
            class="hidden rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white md:inline-flex"
          >
            English
          </button>
          <button
            type="button"
            class="hidden rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-white/40 md:inline-flex"
          >
            Help
          </button>
        </div>
      </header>
    } @else {
      <header
        class="mb-0 flex flex-wrap items-center justify-between gap-3 border-b border-transparent"
      >
        <a
          routerLink="/"
          class="flex min-w-0 items-center gap-3 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-900/30"
        >
          <div
            class="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full bg-white/90 shadow-sm ring-1 ring-white/60"
          >
            <img
              src="/assets/icons/owl_icon.png"
              alt=""
              class="h-full w-full rounded-full object-cover"
            />
          </div>
          <span class="text-lg font-bold text-[#213855]">{{ brand }}</span>
        </a>

        <div class="flex flex-wrap items-center justify-end gap-3 md:gap-4">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#213855]/90 transition hover:bg-white/35"
          >
            English
          </button>
          @if (auth.currentUser(); as user) {
            <span class="hidden text-sm text-[#213855]/85 sm:inline">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <button
              type="button"
              class="rounded-lg bg-[#1a2332] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
              (click)="auth.logout()"
            >
              Log out
            </button>
          }
        </div>
      </header>
    }
  `,
})
export class LandingHeroHeaderComponent {
  @Input() brand = '';
  /** `marketing` — лендінг; `app` — після входу (мова + користувач). */
  @Input() layout: LandingHeaderLayout = 'marketing';

  protected readonly auth = inject(AuthService);
}
