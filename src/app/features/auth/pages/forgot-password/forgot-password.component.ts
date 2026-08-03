import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthPlansBackdropComponent],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="forgot-password-title"
      [shellClass]="shellClass"
      (backdropClick)="close()"
    >
      <div class="container">
        <div
          class="relative w-full rounded-[15px] bg-white p-8 pb-7 pt-10 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5"
        >
          <button
            type="button"
            class="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            (click)="close()"
            aria-label="Close"
          >
            <span class="block text-2xl leading-none">&times;</span>
          </button>

          <h1
            id="forgot-password-title"
            class="mb-3 text-center text-2xl font-bold tracking-tight text-slate-900"
          >
            Forgot password
          </h1>
          <p class="mb-6 text-center text-sm text-slate-600">
            Enter your account email. We will send a link to reset your password.
          </p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
            <div>
              <label for="forgot-email" class="mb-1.5 block text-sm font-medium text-slate-600"
                >Email</label
              >
              <input
                id="forgot-email"
                type="email"
                formControlName="email"
                autocomplete="email"
                class="block w-full rounded-xl border-0 bg-[#EBF2FA] px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5D9ED]"
              />
            </div>

            @if (message()) {
              <p
                class="rounded-lg px-3 py-2 text-sm"
                [class.bg-emerald-50]="success()"
                [class.text-emerald-800]="success()"
                [class.bg-rose-50]="!success()"
                [class.text-rose-800]="!success()"
                role="alert"
              >
                {{ message() }}
              </p>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full rounded-xl bg-[#888C94] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#787C84] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>

          <p class="mt-7 text-center text-sm">
            <a
              routerLink="/auth/login"
              class="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >Back to login</a
            >
          </p>
        </div>
      </div>
    </app-auth-plans-backdrop>
  `,
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly shellClass = 'max-w-[min(100%,420px)] items-center justify-center';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  message = signal<string | null>(null);
  success = signal(false);

  ngOnInit(): void {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    void this.router.navigate(['/auth/login']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.message.set(null);
    const email = this.form.controls.email.value.trim().toLowerCase();
    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.message.set(res.message);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.success.set(false);
        this.message.set(this.describeError(err));
      },
    });
  }

  private describeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.trim()) return body.trim();
      if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message?: string }).message;
        if (m?.trim()) return m.trim();
      }
    }
    return 'Could not send reset email. Please try again.';
  }
}
