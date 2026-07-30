import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { StudentRow } from '../../models/school-admin-dashboard.model';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import {
  adminGridListLabel,
  useAdminGridCardLayout,
} from '../../../../shared/hooks/use-admin-grid-card-layout.hook';

@Component({
  selector: 'app-student-grid-card',
  standalone: true,
  imports: [CommonModule, EmailLinkComponent],
  template: `
    <article [class]="layout.articleClass">
      <div [class]="layout.headerWrapClass">
        <div [class]="layout.headerMainClass">
          <p [class]="layout.indexClass">#{{ displayIndex }}</p>
          <h3 [class]="layout.indexedTitleClass">{{ student.fullName }}</h3>
        </div>
      </div>

      <dl [class]="layout.dlClass">
        <div [class]="layout.dlRowStackClass">
          <dt [class]="layout.dtClass">Email</dt>
          <dd [class]="layout.ddBreakClass">
            <app-email-link [email]="student.email" />
          </dd>
        </div>
        <div [class]="layout.dlRowSplitClass">
          <dt [class]="layout.dtClass">Groups</dt>
          <dd [class]="layout.ddBreakRightClass">
            @if (groupLabel) {
              {{ groupLabel }}
            } @else {
              <span [class]="layout.emptyDashClass">—</span>
            }
          </dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Joined</dt>
          <dd [class]="layout.ddValueClass">{{ student.joinedAt }}</dd>
        </div>
      </dl>
    </article>
  `,
})
export class StudentGridCardComponent {
  @Input({ required: true }) student!: StudentRow;
  @Input({ required: true }) displayIndex!: number;

  protected readonly layout = useAdminGridCardLayout();

  get groupLabel(): string | null {
    return adminGridListLabel(this.student.groupNames);
  }
}
