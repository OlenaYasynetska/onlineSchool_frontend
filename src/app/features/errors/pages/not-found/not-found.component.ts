import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-not-found',
  imports: [CommonModule],
  host: {
    class: 'flex min-h-0 min-w-0 h-full flex-1 flex-col overflow-hidden',
  },
  template: `
    <div
      class="flex min-h-0 h-full w-full flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-[#FF7A18] via-[#FFC857] to-[#FFF1B8] bg-fixed px-4 py-4 md:py-8"
    >
      <div class="mx-auto flex w-full max-w-[1280px] justify-center">
        <div
          class="flex w-full max-w-[min(100%,960px)] flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10 md:gap-12"
        >
          <div class="w-full max-w-[460px] text-center">
            <h1 class="mb-3 text-3xl font-extrabold text-slate-900">
              Oops! Page not found
            </h1>
            <p class="mb-6 text-sm text-slate-800">
              Looks like this page got lost...
              <br />
              let’s help it find the way back home
            </p>

            <div class="flex justify-center">
              <button
                type="button"
                (click)="goHome()"
                class="rounded-md bg-[#F28C28] px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 transition"
              >
                Homepage
              </button>
            </div>
          </div>

          <div class="flex min-w-0 w-full max-w-[min(100%,780px)] shrink-0 justify-center sm:w-auto">
            <div class="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <img
                src="/assets/images/page_404.png"
                alt="Page not found illustration"
                class="h-auto w-full max-w-[560px] max-h-[min(68vh,560px)] object-contain drop-shadow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  constructor(private readonly router: Router) {}

  goHome(): void {
    // Return to the public landing page.
    void this.router.navigate(['/']);
  }
}

