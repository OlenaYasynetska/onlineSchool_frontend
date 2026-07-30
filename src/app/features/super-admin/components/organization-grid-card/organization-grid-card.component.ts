import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { OrganizationRow } from '../../models/super-admin-dashboard.model';
import {
  schoolPlanBadgeClass,
  schoolPlanBadgeLabel,
} from '../../school-plan-badge';
import { useAdminGridCardLayout } from '../../../../shared/hooks/use-admin-grid-card-layout.hook';
import { organizationStatusClass } from '../../hooks/use-organization-status-style.hook';

@Component({
  selector: 'app-organization-grid-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article [class]="layout.articleClass">
      <div [class]="layout.headerWrapClass">
        <div [class]="layout.headerMainClass">
          <p [class]="layout.indexClass">#{{ displayIndex }}</p>
          <h3 [class]="layout.indexedTitleClass">{{ org.name }}</h3>
        </div>
        <span
          [class]="layout.planBadgeBaseClass"
          [ngClass]="planBadgeClass(org.plan)"
          >{{ planBadgeLabel(org.plan) }}</span
        >
      </div>

      <dl [class]="layout.dlClass">
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Status</dt>
          <dd [ngClass]="statusClass(org.status)">{{ org.status }}</dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Next billing</dt>
          <dd [class]="layout.ddValueClass">{{ org.nextBilling }}</dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Registration</dt>
          <dd [class]="layout.ddValueClass">{{ org.registered }}</dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Total</dt>
          <dd [class]="layout.ddStrongClass">{{ org.totalReceived }}</dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Students</dt>
          <dd class="font-medium text-slate-700">{{ org.studentCount ?? 0 }}</dd>
        </div>
      </dl>

      <div [class]="layout.actionsRowClass">
        <a
          [routerLink]="['/super-admin/organizations', org.id, 'edit']"
          [class]="layout.editBtnClass"
          aria-label="Edit organization"
        >
          Edit
        </a>
        <a
          [routerLink]="['/super-admin/organizations', org.id]"
          [class]="layout.viewBtnClass"
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

  protected readonly layout = useAdminGridCardLayout();
  readonly planBadgeClass = schoolPlanBadgeClass;
  readonly planBadgeLabel = schoolPlanBadgeLabel;
  readonly statusClass = organizationStatusClass;
}
