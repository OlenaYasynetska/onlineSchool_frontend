import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { StudentRow } from '../../models/school-admin-dashboard.model';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';

@Component({
  selector: 'app-student-grid-card',
  standalone: true,
  imports: [CommonModule, EmailLinkComponent],
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
            {{ student.fullName }}
          </h3>
        </div>
      </div>

      <dl class="mt-4 flex-1 space-y-2.5 text-sm">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt class="shrink-0 text-slate-500">Email</dt>
          <dd class="min-w-0 sm:text-right">
            <app-email-link [email]="student.email" />
          </dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <dt class="shrink-0 text-slate-500">Groups</dt>
          <dd class="text-slate-700 sm:text-right">
            @if (student.groupNames?.length) {
              {{ student.groupNames!.join(', ') }}
            } @else {
              <span class="text-slate-400">—</span>
            }
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-slate-500">Joined</dt>
          <dd class="text-slate-700">{{ student.joinedAt }}</dd>
        </div>
      </dl>
    </article>
  `,
})
export class StudentGridCardComponent {
  @Input({ required: true }) student!: StudentRow;
  @Input({ required: true }) displayIndex!: number;
}
