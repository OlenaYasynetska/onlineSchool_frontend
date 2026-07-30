import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SchoolTeacher } from '../../models/school-admin-dashboard.model';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import {
  adminGridListLabel,
  useAdminGridCardLayout,
} from '../../../../shared/hooks/use-admin-grid-card-layout.hook';

@Component({
  selector: 'app-teacher-grid-card',
  standalone: true,
  imports: [CommonModule, EmailLinkComponent],
  template: `
    <article [class]="layout.articleClass">
      <div [class]="layout.headerWrapClass">
        <div [class]="layout.headerMainClass">
          <p [class]="layout.indexClass">#{{ displayIndex }}</p>
          <h3 [class]="layout.indexedTitleClass">{{ teacher.displayName }}</h3>
        </div>
      </div>

      <dl [class]="layout.dlClass">
        <div [class]="layout.dlRowStackClass">
          <dt [class]="layout.dtClass">Email</dt>
          <dd [class]="layout.ddBreakClass">
            <app-email-link [email]="teacher.email" />
          </dd>
        </div>
        <div [class]="layout.dlRowPairClass">
          <dt [class]="layout.dtInlineClass">Tel.</dt>
          <dd [class]="layout.ddValueClass">
            @if (teacher.phone) {
              {{ teacher.phone }}
            } @else {
              <span [class]="layout.emptyDashClass">—</span>
            }
          </dd>
        </div>
        <div [class]="layout.dlRowSplitClass">
          <dt [class]="layout.dtClass">Subjects</dt>
          <dd [class]="layout.ddBreakRightClass">
            @if (subjectLabel) {
              {{ subjectLabel }}
            } @else {
              <span [class]="layout.emptyDashClass">—</span>
            }
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
      </dl>
    </article>
  `,
})
export class TeacherGridCardComponent {
  @Input({ required: true }) teacher!: SchoolTeacher;
  @Input({ required: true }) displayIndex!: number;

  protected readonly layout = useAdminGridCardLayout();

  get subjectLabel(): string | null {
    return adminGridListLabel(this.teacher.subjectTitles);
  }

  get groupLabel(): string | null {
    return adminGridListLabel(this.teacher.groupNames);
  }
}
