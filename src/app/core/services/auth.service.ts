import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
} from '../config/super-admin.credentials';
import type { AuthUser, User } from '../models';

export interface LoginRequest {
  email: string;
  password: string;
}

/** Відповідає `RegisterRequest` на бекенді (Spring) */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  organizationName: string;
  plan: string;
  paymentPeriod: string;
  address: string;
  country: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.restoreSession();
  }

  /**
   * В backend auth-контроллеры мапятся на `/auth/*` без префикса `/api`,
   * а остальные контроллеры (students/super-admin/...) используют `/api/*`.
   */
  private readonly authBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  /**
   * Перевірка захардкоджених облікових даних суперадміна (без запиту на бекенд).
   * Повертає true, якщо сесію створено.
   */
  loginAsSuperAdminIfValid(identifier: string, password: string): boolean {
    const email = identifier.trim().toLowerCase();
    if (
      email !== SUPER_ADMIN_EMAIL.toLowerCase() ||
      password !== SUPER_ADMIN_PASSWORD
    ) {
      return false;
    }
    const now = new Date().toISOString();
    const authUser: AuthUser = {
      id: 'local-super-admin',
      email: SUPER_ADMIN_EMAIL,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      createdAt: now,
      updatedAt: now,
      accessToken: 'local-super-admin',
      expiresAt: Date.now() + 86400000 * 7,
    };
    this.currentUserSignal.set(authUser);
    this.persistSession(authUser);
    return true;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authBaseUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          const authUser: AuthUser = {
            ...res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: Date.now() + res.expiresIn * 1000,
          };
          this.currentUserSignal.set(authUser);
          this.persistSession(authUser);
        })
      );
  }

  register(body: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authBaseUrl}/auth/register`, body)
      .pipe(
        tap((res) => {
          // После регистрации сразу создаём сессию (чтобы кнопка в модалке/дашборд работали без повторного логина)
          const authUser: AuthUser = {
            ...res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: Date.now() + res.expiresIn * 1000,
          };
          this.currentUserSignal.set(authUser);
          this.persistSession(authUser);
        })
      );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('auth_user');
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return this.currentUserSignal()?.accessToken ?? null;
  }

  private persistSession(user: AuthUser): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return;
      const user = JSON.parse(stored) as AuthUser;
      if (user.expiresAt && user.expiresAt > Date.now()) {
        this.currentUserSignal.set(user);
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch {
      localStorage.removeItem('auth_user');
    }
  }
}
