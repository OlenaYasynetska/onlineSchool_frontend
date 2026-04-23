import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registration-success.component.html',
})
export class RegistrationSuccessComponent {
  @Input({ required: true }) organizationName!: string;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly goDashboard = new EventEmitter<void>();
}
