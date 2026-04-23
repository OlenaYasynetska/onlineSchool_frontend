import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { PlanCard } from '../../../landing/hooks/use-plans.hook';
import { PlanCardComponent } from './plan-card.component';

@Component({
  selector: 'app-plans-grid',
  standalone: true,
  imports: [CommonModule, PlanCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-[1200px]">
      <p
        class="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#213855]/70 md:mb-5"
      >
        {{ title }}
      </p>
      <div
        class="grid h-[min(58vh,480px)] w-full grid-cols-3 gap-1.5 sm:gap-3 md:gap-5"
      >
        @for (plan of plans; track plan.id; let i = $index) {
          <app-plan-card [plan]="plan" [bgClass]="columnClasses[i]" />
        }
      </div>
    </div>
  `,
})
export class PlansGridComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) plans!: PlanCard[];

  readonly columnClasses = [
    'bg-orange-50/90',
    'bg-amber-50/90',
    'bg-[#FFF8E0]/90',
  ] as const;
}
