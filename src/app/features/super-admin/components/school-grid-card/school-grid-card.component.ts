import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SchoolCard } from '../../models/super-admin-dashboard.model';
import {
  schoolPlanBadgeClass,
  schoolPlanBadgeLabel,
} from '../../school-plan-badge';
import { useAdminGridCardLayout } from '../../../../shared/hooks/use-admin-grid-card-layout.hook';

@Component({
  selector: 'app-school-grid-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article [class]="layout.articleClassWithMinHeight">
      <div [class]="layout.headerWrapClass">
        <h3 [class]="layout.titleClass">{{ school.title }}</h3>
        <span
          [class]="layout.planBadgeBaseClass"
          [ngClass]="planBadgeClass(school.plan)"
          >{{ planBadgeLabel(school.plan) }}</span
        >
      </div>

      <p [class]="layout.subtitleClass">{{ school.displayName }}</p>

      <p [class]="layout.bodyTextClass">{{ school.address }}</p>

      <p [class]="layout.footerMetaClass">{{ school.studentCount }} students</p>
    </article>
  `,
})
export class SchoolGridCardComponent {
  @Input({ required: true }) school!: SchoolCard;

  protected readonly layout = useAdminGridCardLayout();
  readonly planBadgeClass = schoolPlanBadgeClass;
  readonly planBadgeLabel = schoolPlanBadgeLabel;
}
