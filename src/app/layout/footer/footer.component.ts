import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FooterVariant = 'simple' | 'detailed';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="w-full min-w-0">
      @if (variant === 'detailed') {
        <div
          class="flex w-full min-w-0 flex-col gap-4 border-t border-slate-200/80 bg-slate-50 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10"
        >
          <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:justify-start">
            <a href="#" class="text-slate-600 transition hover:text-slate-900">About Us</a>
            <a href="#" class="text-slate-600 transition hover:text-slate-900"
              >Privacy and cookie statements</a
            >
            <a href="#" class="text-slate-600 transition hover:text-slate-900">FAQs</a>
            <a href="#" class="text-slate-600 transition hover:text-slate-900">Support</a>
          </nav>
          <p class="text-center text-xs text-slate-500 md:text-right">
            © {{ year }} Owl Tracker, Inc. All rights reserved.
          </p>
        </div>
        <div
          class="flex w-full items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-2 md:px-10"
        >
          <img
            src="/assets/icons/owl_icon.png"
            alt=""
            class="h-8 w-8 rounded-full opacity-80"
            width="32"
            height="32"
          />
        </div>
      } @else {
        <div
          class="flex w-full min-w-0 items-center justify-between gap-4 border-t border-white/30 bg-gradient-to-br from-[#FF7A18] via-[#FFC857] to-[#FFF1B8] px-6 py-4 md:px-10 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="text-sm text-slate-900/70 dark:text-gray-400">
            © {{ year }} Education Platform
          </div>
          <div class="text-sm text-slate-900/60 dark:text-gray-400">Owl Tracker</div>
        </div>
      }
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  /** `simple` — градієнт як на лендінгу; `detailed` — посилання та копірайт (суперадмін). */
  @Input() variant: FooterVariant = 'simple';
}
