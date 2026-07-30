import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { OrganizationRow } from '../../models/super-admin-dashboard.model';
import {
  schoolPlanBadgeClass,
  schoolPlanBadgeLabel,
} from '../../school-plan-badge';

@Component({
  selector: 'app-organization-grid-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article
      class="flex h-full flex-col rounded-lg border border-slate-200/90 bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-slate-400">#{{ displayIndex }}</p>
          <h3
            class="mt-0.5 text-[17px] font-bold leading-snug tracking-tight text-[#2D3E50]"
          >
            {{ org.name }}
          </h3>
        </div>
        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide"
          [ngClass]="planBadgeClass(org.plan)"
          >{{ planBadgeLabel(org.plan) }}</span
        >
      </div>

      <dl class="mt-4 flex-1 space-y-2.5 text-sm">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Status</dt>
          <dd [ngClass]="statusClass(org.status)">{{ org.status }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Next billing</dt>
          <dd class="text-slate-700">{{ org.nextBilling }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Registration</dt>
          <dd class="text-slate-700">{{ org.registered }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Total</dt>
          <dd class="font-semibold text-slate-900">{{ org.totalReceived }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Students</dt>
          <dd class="font-medium text-slate-700">{{ org.studentCount ?? 0 }}</dd>
        </div>
      </dl>

      <div class="mt-5 flex flex-wrap gap-2">
        <a
          [routerLink]="['/super-admin/organizations', org.id, 'edit']"
          class="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 sm:flex-none"
          aria-label="Edit organization"
        >
          Edit
        </a>
        <a
          [routerLink]="['/super-admin/organizations', org.id]"
          class="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 sm:flex-none"
          aria-label="View organization"
        >
          View
        </a>
      </div>
    </article>
  `,
})
export class OrganizationGridCardComponent {
  @Input({ required: true }) org!: OrganizationRow;
  @Input({ required: true }) displayIndex!: number;

  readonly planBadgeClass = schoolPlanBadgeClass;
  readonly planBadgeLabel = schoolPlanBadgeLabel;

  statusClass(status: OrganizationRow['status']): string {
    switch (status) {
      case 'Active':
        return 'text-xs font-semibold text-emerald-700';
      case 'Expiring soon':
        return 'text-xs font-semibold text-amber-700';
      case 'Inactive':
        return 'text-xs font-semibold text-slate-500';
      default:
        return 'text-xs text-slate-600';
    }
  }
}
