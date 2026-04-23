import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { RegistrationSuccessComponent } from '../registration-success/registration-success.component';
import {
  PAYMENT_OPTIONS,
  PLAN_OPTIONS,
} from '../register-form/register-form.constants';
import { splitFullName } from '../register-form/register-form.utils';

export type RegistrationStep = 'register' | 'payment' | 'success';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [
    CommonModule,
    RegisterFormComponent,
    PaymentFormComponent,
    RegistrationSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-modal.component.html',
})
export class RegisterModalComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Input() initialPlan: string | null = null;

  @Output() readonly closeRequested = new EventEmitter<void>();

  @ViewChild('registerFormRef') private registerFormRef?: RegisterFormComponent;

  readonly step = signal<RegistrationStep>('register');
  readonly successOrganizationName = signal('');
  readonly paymentLoading = signal(false);

  readonly planOptions = PLAN_OPTIONS;
  readonly paymentOptions = PAYMENT_OPTIONS;

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    organizationName: ['', Validators.required],
    plan: ['', Validators.required],
    paymentPeriod: ['', Validators.required],
    address: ['', Validators.required],
    country: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue],
  });

  paymentForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    countryRegion: ['', Validators.required],
    city: ['', Validators.required],
    phone: ['', Validators.required],
    paymentMethod: ['card'],
    cardNumber: ['', Validators.required],
    expMonth: ['', Validators.required],
    expYear: ['', Validators.required],
    cvv: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
    ],
  });

  readonly loading = signal(false);
  readonly submitAttempted = signal(false);
  readonly submitErrorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.applyPlan(this.initialPlan);
    if (this.isPaymentPreviewRoute()) {
      this.openPaymentPreview();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialPlan']) {
      this.applyPlan(this.initialPlan);
    }
  }

  private isPaymentPreviewRoute(): boolean {
    return this.router.url.includes('payment-preview');
  }

  private openPaymentPreview(): void {
    this.patchPaymentFromRegistration({
      fullName: 'Demo School Admin',
      email: 'demo@example.com',
      phone: '+430000000000',
      address: 'Demo Street 1, Vienna',
      country: 'AT',
    });
    this.step.set('payment');
  }

  private applyPlan(plan: string | null): void {
    if (plan && (plan === 'free' || plan === 'standard' || plan === 'pro')) {
      this.form.patchValue({ plan });
    }
  }

  backToHome(): void {
    void this.router.navigate(['/']);
  }

  goToDashboard(): void {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN_SCHOOL') {
      void this.router.navigate(['/school-admin']);
      return;
    }
    void this.router.navigate(['/dashboard']);
  }

  closePaymentModal(): void {
    void this.router.navigate(['/auth/login']);
  }

  onPaymentSubmit(): void {
    if (this.paymentForm.invalid) return;
    this.paymentLoading.set(true);
    this.paymentLoading.set(false);
    void this.router.navigate(['/auth/login']);
  }

  private patchPaymentFromRegistration(raw: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
  }): void {
    const [firstName, lastName] = splitFullName(raw.fullName);
    const cityGuess = raw.address.includes(',')
      ? raw.address.split(',')[0].trim()
      : raw.address.trim();
    this.paymentForm.reset({
      firstName,
      lastName,
      email: raw.email,
      phone: raw.phone,
      city: cityGuess || '',
      countryRegion: '',
      paymentMethod: 'card',
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvv: '',
    });
  }

  onRegisterSubmit(): void {
    this.submitAttempted.set(true);
    this.submitErrorMessage.set(null);
    const emailCtrl = this.form.controls.email;
    if (emailCtrl.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => this.registerFormRef?.focusFirstInvalidControl());
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => this.registerFormRef?.focusFirstInvalidControl());
      return;
    }
    this.loading.set(true);
    const raw = this.form.getRawValue();
    const [firstName, lastName] = splitFullName(raw.fullName);
    const payload = {
      email: raw.email,
      password: raw.password,
      firstName,
      lastName: lastName || firstName,
      phone: raw.phone,
      dateOfBirth: raw.dateOfBirth,
      organizationName: raw.organizationName,
      plan: raw.plan,
      paymentPeriod: raw.paymentPeriod,
      address: raw.address,
      country: raw.country,
    };
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitErrorMessage.set(null);
        if (raw.plan === 'free') {
          this.successOrganizationName.set(raw.organizationName);
          this.step.set('success');
        } else if (raw.plan === 'standard' || raw.plan === 'pro') {
          this.patchPaymentFromRegistration(raw);
          this.step.set('payment');
        } else {
          void this.router.navigate(['/auth/login']);
        }
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        const msg =
          (err?.error?.message as string | undefined) ??
          (err?.message as string | undefined) ??
          'Registration failed';
        this.submitErrorMessage.set(msg);
      },
    });
  }
}
