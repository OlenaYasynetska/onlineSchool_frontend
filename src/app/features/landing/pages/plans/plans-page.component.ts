import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { usePlans } from '../../hooks/use-plans.hook';
import { useLandingButtons } from '../../hooks/use-landing-buttons.hook';
import { useLandingSections } from '../../hooks/use-landing-sections.hook';
import { FooterComponent } from '../../../../layout/footer/footer.component';

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [RouterLink, FooterComponent],
  host: {
    class: 'block min-h-full w-full',
  },
  template: `
    <div class="relative min-h-full bg-[#FDF6E9]">
      <div class="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-8 md:py-16">
        <div class="mb-8 text-center md:mb-10">
          <h1 class="mb-2 text-4xl font-bold text-[#213855]">
            {{ sections.plansTitle }}
          </h1>
          <p class="text-sm text-slate-700 md:text-base">
            Choose the best option for your school or start for free.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          @for (plan of plans(); track plan.id) {
            <article
              class="flex min-h-[420px] flex-col rounded-xl bg-white p-4 shadow-sm"
            >
              <img
                [src]="plan.image"
                [alt]="plan.title"
                class="mb-3 h-[20rem] w-full rounded-lg object-cover"
              />
              <h2 class="text-lg font-semibold text-slate-900">{{ plan.title }}</h2>
              <p class="mb-3 text-sm text-slate-600">{{ plan.subtitle }}</p>
              <ul class="mb-4 flex-1 space-y-1 text-xs text-slate-600">
                @for (feature of plan.features; track feature) {
                  <li>{{ feature }}</li>
                }
              </ul>
              <a
                [routerLink]="['/auth/register']"
                [queryParams]="{ plan: plan.id }"
                [class]="buttons.subscribePlans.className"
              >
                {{ buttons.subscribePlans.label }}
              </a>
            </article>
          }
        </div>
      </div>

      <app-footer />
    </div>
  `,
})
export class PlansPageComponent {
  readonly plans = usePlans();
  readonly buttons = useLandingButtons();
  readonly sections = useLandingSections();
}
