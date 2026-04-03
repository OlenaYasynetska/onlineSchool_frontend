import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { usePlans } from '../../../landing/hooks/use-plans.hook';
import { useLandingSections } from '../../../landing/hooks/use-landing-sections.hook';

/**
 * Фон із трьома колонками планів (як на register/login).
 * Контент модалки передається через ng-content поверх фону.
 */
@Component({
  selector: 'app-auth-plans-backdrop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="ariaLabelledBy"
    >
      <div
        class="absolute inset-0 z-0 bg-gradient-to-br from-[#FFF8EC] via-[#FDF6E9] to-[#FBE8D4]"
      ></div>

      <div
        class="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-2 py-16 sm:px-4 md:px-8"
        aria-hidden="true"
      >
        <div class="w-full max-w-[1200px]">
          <p
            class="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#213855]/70 md:mb-5"
          >
            {{ sections.plansTitle }}
          </p>
          <div
            class="grid h-[min(58vh,480px)] w-full grid-cols-3 gap-1.5 sm:gap-3 md:gap-5"
          >
            @for (plan of plans(); track plan.id; let i = $index) {
              <div
                class="relative min-h-0 overflow-hidden rounded-2xl shadow-md ring-1 ring-orange-200/50 md:rounded-3xl"
                [ngClass]="planeColumnClasses[i]"
              >
                <img
                  [src]="plan.image"
                  [alt]="plan.title"
                  class="absolute inset-0 h-full w-full scale-110 object-cover object-center transition-transform duration-500"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-b from-[#FF7A18]/20 via-[#FFC857]/15 to-[#FFF1B8]/55"
                ></div>
                <div
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#FDF6E9]/95 via-[#FDF6E9]/70 to-transparent pb-3 pt-16 sm:pb-4"
                >
                  <p
                    class="px-2 text-center text-[10px] font-bold leading-tight text-[#213855] sm:text-xs md:text-sm"
                  >
                    {{ plan.title }}
                  </p>
                  <p
                    class="mt-0.5 px-1 text-center text-[9px] text-slate-600 sm:text-[10px] md:text-xs"
                  >
                    {{ plan.subtitle }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,#FDF6E9/90_100%)]"
        aria-hidden="true"
      ></div>

      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-16 overflow-hidden sm:h-20"
        aria-hidden="true"
      >
        <svg
          class="absolute inset-0 h-full w-full text-[#FDF6E9]"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0 34 C 140 70 300 6 470 30 C 640 54 820 8 1000 28 C 1170 48 1310 24 1440 36 L1440 0 L0 0 Z"
            fill="currentColor"
          />
          <path
            d="M0 58 C 130 90 280 122 450 104 C 620 86 780 46 960 62 C 1140 78 1285 120 1440 102 L1440 160 L0 160 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div
        class="absolute inset-0 z-[15] cursor-default bg-transparent"
        (click)="backdropClick.emit()"
        aria-hidden="true"
      ></div>

      <div
        class="relative z-20 flex w-full flex-col"
        [ngClass]="shellClass"
        (click)="$event.stopPropagation()"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class AuthPlansBackdropComponent {
  /** id елемента з заголовком модалки (наприклад register-title / login-title) */
  @Input({ required: true }) ariaLabelledBy!: string;

  /**
   * Додаткові класи для обгортки контенту (ширина, відступи).
   * За замовуванням — як на сторінці реєстрації.
   */
  @Input() shellClass =
    'max-w-[min(100%,980px)] items-center justify-center overflow-visible pb-8 sm:pb-10';

  @Output() readonly backdropClick = new EventEmitter<void>();

  readonly plans = usePlans();
  readonly sections = useLandingSections();

  readonly planeColumnClasses = [
    'bg-orange-50/90',
    'bg-amber-50/90',
    'bg-[#FFF8E0]/90',
  ] as const;
}
