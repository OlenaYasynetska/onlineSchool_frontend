import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthUser, User } from '../models';

export interface LoginRequest {
  email: string;
  password: string;
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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
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
