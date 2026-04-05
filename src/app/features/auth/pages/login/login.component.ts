import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthPlansBackdropComponent,
  ],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="login-title"
      [shellClass]="loginShellClass"
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
            id="login-title"
            class="mb-7 text-center text-2xl font-bold tracking-tight text-slate-900"
          >
            Login
          </h1>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
          <div>
            <label
              for="role-identifier"
              class="mb-1.5 block text-sm font-medium text-slate-600"
              >Role identifier</label
            >
            <input
              id="role-identifier"
              type="text"
              formControlName="roleIdentifier"
              autocomplete="username"
              placeholder=""
              class="block w-full rounded-xl border-0 bg-[#EBF2FA] px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5D9ED]"
              aria-label="Role identifier"
            />
          </div>
          <div>
            <label
              for="login-password"
              class="mb-1.5 block text-sm font-medium text-slate-600"
              >Password</label
            >
            <input
              id="login-password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="block w-full rounded-xl border-0 bg-[#EBF2FA] px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5D9ED]"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full rounded-xl bg-[#888C94] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#787C84] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ loading() ? 'Signing in…' : 'Log in' }}
          </button>
          </form>

          <p class="mt-7 text-center text-sm">
            <a
              routerLink="/auth/register"
              class="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >Sign up</a
            >
          </p>
        </div>
      </div>
    </app-auth-plans-backdrop>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Вужча колонка для картки логіну */
  readonly loginShellClass =
    'max-w-[min(100%,420px)] items-center justify-center';

  form = this.fb.nonNullable.group({
    roleIdentifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = signal(false);

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
    void this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { roleIdentifier, password } = this.form.getRawValue();
    if (this.auth.loginAsSuperAdminIfValid(roleIdentifier, password)) {
      void this.router.navigate(['/super-admin']);
      return;
    }
    this.loading.set(true);
    this.auth
      .login({ email: roleIdentifier.trim(), password })
      .subscribe({
        next: () => {
          this.loading.set(false);
          const role = this.auth.currentUser()?.role;
          switch (role) {
            case 'ADMIN_SCHOOL':
              void this.router.navigate(['/school-admin']);
              break;
            case 'TEACHER':
              void this.router.navigate(['/teacher']);
              break;
            case 'STUDENT':
              void this.router.navigate(['/students']);
              break;
            default:
              void this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
  }
}
