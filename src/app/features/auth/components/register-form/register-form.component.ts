import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, type FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { PlanOption, PaymentOption } from './register-form.constants';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input({ required: true }) form!: FormGroup;
  @Input() loading = false;
  @Input() submitAttempted = false;
  @Input() errorMessage: string | null = null;

  @Input({ required: true }) planOptions!: readonly PlanOption[];
  @Input({ required: true }) paymentOptions!: readonly PaymentOption[];

  @Output() readonly submit = new EventEmitter<void>();
  @Output() readonly closeRequested = new EventEmitter<void>();

  readonly passwordVisible = signal(false);

  emailFieldShowError(): boolean {
    if (!this.form) return false;
    const c = this.form.controls['email'];
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /** Викликає батьківський контейнер після невалідного сабміту. */
  focusFirstInvalidControl(): void {
    const firstInvalid = Object.entries(this.form.controls).find(
      ([, c]) => c.invalid,
    )?.[0];
    if (!firstInvalid) return;
    const el = this.host.nativeElement.querySelector(
      `[formControlName="${firstInvalid}"]`,
    ) as HTMLElement | null;
    el?.focus?.();
  }
}
