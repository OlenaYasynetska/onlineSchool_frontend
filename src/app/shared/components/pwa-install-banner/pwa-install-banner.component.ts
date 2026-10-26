import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (pwa.canInstall()) {
      <div
        class="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-lg shadow-slate-900/15 sm:flex-row sm:items-center sm:justify-between"
        role="region"
        aria-label="Install app"
      >
        <div class="min-w-0 text-sm text-slate-700">
          <p class="font-semibold text-slate-900">Install Owl Tracker</p>
          <p class="mt-0.5 text-slate-600">
            Add the app to your home screen for quick access on phone, tablet, or laptop.
          </p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            (click)="pwa.dismiss()"
          >
            Not now
          </button>
          <button
            type="button"
            class="rounded-lg bg-[#FF7A18] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            (click)="pwa.install()"
          >
            Install
          </button>
        </div>
      </div>
    }
  `,
})
export class PwaInstallBannerComponent {
  readonly pwa = inject(PwaInstallService);
}
