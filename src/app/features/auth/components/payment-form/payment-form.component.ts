import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, type FormGroup } from '@angular/forms';
import {
  COUNTRY_OPTIONS,
  MONTH_NUMBERS,
  YEAR_NUMBERS,
} from '../register-form/register-form.constants';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;

  @Output() readonly submit = new EventEmitter<void>();
  @Output() readonly close = new EventEmitter<void>();

  readonly countryOptions = COUNTRY_OPTIONS;
  readonly monthNumbers = MONTH_NUMBERS;
  readonly yearNumbers = YEAR_NUMBERS;
}
