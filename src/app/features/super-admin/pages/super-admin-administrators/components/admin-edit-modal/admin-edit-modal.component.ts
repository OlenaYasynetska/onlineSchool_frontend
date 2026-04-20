import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-admin-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-edit-modal.component.html',
})
export class AdminEditModalComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly submit = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
