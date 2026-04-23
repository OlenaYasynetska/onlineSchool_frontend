import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlansGridComponent } from './plans-grid.component';
import { usePlans } from '../../../landing/hooks/use-plans.hook';
import { useLandingSections } from '../../../landing/hooks/use-landing-sections.hook';

/**
 * Контейнер: фон, хвилі, клік по backdrop, проєкція контенту модалки (ng-content).
 * Сітку планів ренерить {@link PlansGridComponent}.
 */
@Component({
  selector: 'app-auth-plans-backdrop',
  standalone: true,
  imports: [CommonModule, PlansGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        <app-plans-grid [title]="sections.plansTitle" [plans]="plans()" />
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
}
