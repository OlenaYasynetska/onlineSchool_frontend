import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailLinkComponent } from '../../../../../../shared/components/email-link/email-link.component';
import type { SchoolAdminContactRow } from '../../../../models/super-admin-dashboard.model';

@Component({
  selector: 'app-admins-table',
  standalone: true,
  imports: [CommonModule, EmailLinkComponent],
  templateUrl: './admins-table.component.html',
})
export class AdminsTableComponent {
  @Input() rows: SchoolAdminContactRow[] = [];
  @Input() filtered: SchoolAdminContactRow[] = [];
  @Input() deactivatingUserId: string | null = null;
  @Input() reactivatingUserId: string | null = null;

  @Output() readonly edit = new EventEmitter<SchoolAdminContactRow>();
  @Output() readonly deactivate = new EventEmitter<SchoolAdminContactRow>();
  @Output() readonly reactivate = new EventEmitter<SchoolAdminContactRow>();
  @Output() readonly clearSearch = new EventEmitter<void>();
}
