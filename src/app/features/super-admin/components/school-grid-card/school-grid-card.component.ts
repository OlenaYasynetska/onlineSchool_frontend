import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SchoolCard } from '../../models/super-admin-dashboard.model';

@Component({
  selector: 'app-school-grid-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="flex h-full min-h-[188px] flex-col rounded-lg border border-slate-200/90 bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
        <h3
          class="text-[17px] font-bold leading-snug tracking-tight text-[#2D3E50]"
        >
          {{ school.title }}
        </h3>
        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-white"
          [ngClass]="badgeClass(school.plan)"
          >{{ badgeLabel(school.plan) }}</span
        >
      </div>

      <p class="mt-2 text-[15px] font-semibold leading-snug text-[#E67E22]">
        {{ school.displayName }}
      </p>

      <p
        class="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600"
      >
        {{ school.address }}
      </p>

      <p class="mt-4 text-right text-xs text-slate-400">
        {{ school.studentCount }} students
      </p>
    </article>
  `,
})
export class SchoolGridCardComponent {
  @Input({ required: true }) school!: SchoolCard;

  badgeClass(plan: SchoolCard['plan']): string {
    switch (plan) {
      case 'Pro':
        return 'bg-[#E67E22] shadow-sm';
      case 'Standard':
        return 'bg-blue-600 shadow-sm';
      default:
        return 'bg-slate-400 shadow-sm';
    }
  }

  /** Підписи як на референсі (PRO / Standart / Free). */
  badgeLabel(plan: SchoolCard['plan']): string {
    switch (plan) {
      case 'Pro':
        return 'PRO';
      case 'Standard':
        return 'Standart';
      default:
        return 'Free';
    }
  }
}
