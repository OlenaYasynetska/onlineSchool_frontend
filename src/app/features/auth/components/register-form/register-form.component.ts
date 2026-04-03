import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  type OnChanges,
  type OnInit,
  Output,
  type SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import {
  COUNTRY_OPTIONS,
  MONTH_NUMBERS,
  PAYMENT_OPTIONS,
  PLAN_OPTIONS,
  YEAR_NUMBERS,
} from './register-form.constants';
import { splitFullName } from './register-form.utils';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() initialPlan: string | null = null;

  @Output() readonly closeRequested = new EventEmitter<void>();

  readonly passwordVisible = signal(false);

  /** Після реєстрації з безкоштовним тарифом показуємо екран успіху замість переходу на логін */
  readonly registrationSuccess = signal(false);
  readonly successOrganizationName = signal('');

  /** Після реєстрації з платним тарифом — крок оплати */
  readonly showPaymentStep = signal(false);
  readonly paymentLoading = signal(false);

  readonly monthNumbers = MONTH_NUMBERS;
  readonly yearNumbers = YEAR_NUMBERS;
  readonly countryOptions = COUNTRY_OPTIONS;
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

  loading = signal(false);
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

  /** Демо вікна оплати: маршрут /auth/register/payment-preview */
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
    this.showPaymentStep.set(true);
  }

  private applyPlan(plan: string | null): void {
    if (
      plan &&
      (plan === 'free' || plan === 'standard' || plan === 'pro')
    ) {
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
    this.showPaymentStep.set(false);
    void this.router.navigate(['/auth/login']);
  }

  onPaymentSubmit(): void {
    if (this.paymentForm.invalid) return;
    this.paymentLoading.set(true);
    // Інтеграція з платіжним провайдером — окремо
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

  /** Червона обводка email після спроби відправити форму або після touch */
  emailFieldShowError(): boolean {
    const c = this.form.controls.email;
    return c.invalid && c.touched;
  }

  onSubmit(): void {
    this.submitAttempted.set(true);
    this.submitErrorMessage.set(null);
    const emailCtrl = this.form.controls.email;
    if (emailCtrl.invalid) {
      // Чтобы пользователь сразу увидел причину и подсветку ошибок
      // (включая красную обводку email при нажатии Confirm).
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
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
          this.registrationSuccess.set(true);
        } else if (raw.plan === 'standard' || raw.plan === 'pro') {
          this.patchPaymentFromRegistration(raw);
          this.showPaymentStep.set(true);
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

  private focusFirstInvalidControl(): void {
    const firstInvalid = Object.entries(this.form.controls).find(
      ([, c]) => c.invalid,
    )?.[0];

    if (!firstInvalid) return;

    // В DOM у input/select сохраняется formControlName атрибут.
    const el = this.host.nativeElement.querySelector(
      `[formControlName="${firstInvalid}"]`,
    ) as HTMLElement | null;

    // Если фокус не нашли (например для checkbox без id) — не мешаем, просто выходим.
    el?.focus?.();
  }
}
