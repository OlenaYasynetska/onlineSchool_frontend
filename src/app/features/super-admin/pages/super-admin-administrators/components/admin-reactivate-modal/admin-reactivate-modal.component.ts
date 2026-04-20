import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SchoolAdminContactRow } from '../../../../models/super-admin-dashboard.model';

@Component({
  selector: 'app-admin-reactivate-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reactivate-modal.component.html',
})
export class AdminReactivateModalComponent {
  @Input({ required: true }) row!: SchoolAdminContactRow;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.close.emit();
    }
  }
}
