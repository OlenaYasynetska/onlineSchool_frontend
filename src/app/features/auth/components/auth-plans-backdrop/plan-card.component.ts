import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { PlanCard } from '../../../landing/hooks/use-plans.hook';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative min-h-0 overflow-hidden rounded-2xl shadow-md ring-1 ring-orange-200/50 md:rounded-3xl"
      [ngClass]="bgClass"
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
  `,
})
export class PlanCardComponent {
  @Input({ required: true }) plan!: PlanCard;
  @Input() bgClass = '';
}
