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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthPlansBackdropComponent],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="verify-email-title"
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
            id="verify-email-title"
            class="mb-3 text-center text-2xl font-bold tracking-tight text-slate-900"
          >
            Email confirmation
          </h1>

          @if (loading()) {
            <p class="text-center text-sm text-slate-600">Confirming your email…</p>
          } @else if (message()) {
            <p
              class="rounded-lg px-3 py-2 text-sm"
              [class.bg-emerald-50]="verified()"
              [class.text-emerald-800]="verified()"
              [class.bg-rose-50]="!verified()"
              [class.text-rose-800]="!verified()"
              role="alert"
            >
              {{ message() }}
            </p>
          }

          @if (!tokenFromLink() && !loading()) {
            <form [formGroup]="form" (ngSubmit)="resend()" class="mt-6 space-y-4" novalidate>
              <p class="text-sm text-slate-600">
                Did not receive the email? Enter your address and we will resend the confirmation link.
              </p>
              <input
                type="email"
                formControlName="email"
                placeholder="your@email.com"
                class="block w-full rounded-xl border-0 bg-[#EBF2FA] px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5D9ED]"
              />
              <button
                type="submit"
                [disabled]="form.invalid || resendLoading()"
                class="w-full rounded-xl bg-[#888C94] py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {{ resendLoading() ? 'Sending…' : 'Resend confirmation email' }}
              </button>
            </form>
          }

          <p class="mt-7 text-center text-sm">
            <a
              routerLink="/auth/login"
              class="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >Go to login</a
            >
          </p>
        </div>
      </div>
    </app-auth-plans-backdrop>
  `,
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly shellClass = 'max-w-[min(100%,420px)] items-center justify-center';

  loading = signal(false);
  resendLoading = signal(false);
  message = signal<string | null>(null);
  verified = signal(false);
  tokenFromLink = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    this.tokenFromLink.set(token);
    if (token) {
      this.confirmToken(token);
    }
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

  private confirmToken(token: string): void {
    this.loading.set(true);
    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.verified.set(res.verified);
        this.message.set(res.message);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.verified.set(false);
        this.message.set(this.describeError(err));
      },
    });
  }

  resend(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.resendLoading.set(true);
    const email = this.form.controls.email.value.trim().toLowerCase();
    this.auth.resendVerification(email).subscribe({
      next: (res) => {
        this.resendLoading.set(false);
        this.verified.set(true);
        this.message.set(res.message);
      },
      error: (err: unknown) => {
        this.resendLoading.set(false);
        this.verified.set(false);
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
    return 'Could not verify email. The link may have expired.';
  }
}
