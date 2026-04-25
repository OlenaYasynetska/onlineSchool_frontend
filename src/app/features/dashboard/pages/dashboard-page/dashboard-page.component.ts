import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SuperAdminDashboardService } from '../../../super-admin/services/super-admin-dashboard.service';
import type { PlatformSummary } from '../../../super-admin/models/super-admin-dashboard.model';
import { SchoolAdminDashboardService } from '../../../school-admin/services/school-admin-dashboard.service';
import type { SchoolDashboardStats } from '../../../school-admin/models/school-admin-dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      @if (isSuperAdmin()) {
        @if (loadError()) {
          <p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            {{ loadError() }}
          </p>
        }
      }
      @if (isSchoolAdmin()) {
        @if (schoolLoadError()) {
          <p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            {{ schoolLoadError() }}
          </p>
        }
      }
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-card>
          <p class="text-sm text-gray-500">Students</p>
          <p class="text-2xl font-semibold">{{ statStudents() }}</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Teachers</p>
          <p class="text-2xl font-semibold">{{ statTeachers() }}</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Schools</p>
          <p class="text-2xl font-semibold">{{ statSchools() }}</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Courses</p>
          <p class="text-2xl font-semibold">{{ statCourses() }}</p>
        </app-card>
      </div>
    </div>
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly superDash = inject(SuperAdminDashboardService);
  private readonly schoolDash = inject(SchoolAdminDashboardService);

  private readonly summary = signal<PlatformSummary | null>(null);
  readonly loadError = signal<string | null>(null);
  private readonly loading = signal(false);

  private readonly schoolStats = signal<SchoolDashboardStats | null>(null);
  readonly schoolLoadError = signal<string | null>(null);
  private readonly schoolLoading = signal(false);

  isSuperAdmin(): boolean {
    return this.auth.currentUser()?.role === 'SUPER_ADMIN';
  }

  isSchoolAdmin(): boolean {
    return this.auth.currentUser()?.role === 'ADMIN_SCHOOL';
  }

  statStudents(): string {
    if (this.isSuperAdmin()) {
      return this.formatPlatformStat((s) => s.students);
    }
    if (this.isSchoolAdmin()) {
      return this.formatSchoolStat((s) => s.totalStudents);
    }
    return '—';
  }

  statTeachers(): string {
    if (this.isSuperAdmin()) {
      return this.formatPlatformStat((s) => s.teachers);
    }
    if (this.isSchoolAdmin()) {
      return this.formatSchoolStat((s) => s.totalTeachers);
    }
    return '—';
  }

  statSchools(): string {
    if (this.isSuperAdmin()) {
      return this.formatPlatformStat((s) => s.schools);
    }
    if (this.isSchoolAdmin()) {
      if (this.schoolLoading()) {
        return '…';
      }
      if (this.schoolLoadError()) {
        return '—';
      }
      return '1';
    }
    return '—';
  }

  statCourses(): string {
    if (this.isSuperAdmin()) {
      return this.formatPlatformStat((s) => s.courses);
    }
    if (this.isSchoolAdmin()) {
      return this.formatSchoolStat((s) => s.totalSubjects);
    }
    return '—';
  }

  private formatPlatformStat(pick: (s: PlatformSummary) => number): string {
    if (!this.isSuperAdmin()) {
      return '—';
    }
    if (this.loading()) {
      return '…';
    }
    if (this.loadError()) {
      return '—';
    }
    const s = this.summary();
    if (!s) {
      return '—';
    }
    return String(pick(s));
  }

  private formatSchoolStat(pick: (s: SchoolDashboardStats) => number): string {
    if (this.schoolLoading()) {
      return '…';
    }
    if (this.schoolLoadError()) {
      return '—';
    }
    const s = this.schoolStats();
    if (!s) {
      return '—';
    }
    return String(pick(s));
  }

  ngOnInit(): void {
    if (this.isSuperAdmin()) {
      this.loading.set(true);
      this.loadError.set(null);
      this.superDash.getDashboard().subscribe({
        next: (data) => {
          this.summary.set(data.summary ?? null);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loadError.set(this.describeDashboardLoadError(err));
          this.loading.set(false);
        },
      });
      return;
    }

    if (this.isSchoolAdmin()) {
      const schoolId = this.normalizeSchoolId(this.auth.currentUser()?.schoolId);
      if (!schoolId) {
        this.schoolLoadError.set(
          'Обліковий запис без привʼязки до школи (немає schoolId). Зверніться до підтримки.',
        );
        return;
      }
      this.schoolLoading.set(true);
      this.schoolLoadError.set(null);
      this.schoolDash.getDashboard(schoolId).subscribe({
        next: (data) => {
          this.schoolStats.set(data.stats);
          this.schoolLoading.set(false);
        },
        error: (err: unknown) => {
          this.schoolLoadError.set(this.describeSchoolDashboardError(err));
          this.schoolLoading.set(false);
        },
      });
    }
  }

  private normalizeSchoolId(raw: string | null | undefined): string {
    const t = raw?.trim();
    return t && t.length > 0 ? t : '';
  }

  private describeDashboardLoadError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) {
        return (
          '401 Unauthorized: зайдіть знову через логін (реальний обліковий запис у БД). ' +
          'Локальний «суперадмін» без бекенду не підходить для запитів до API. ' +
          'На Vercel: перевірте NG_APP_API_URL і чи не блокує Deployment Protection запити до /api.'
        );
      }
      if (err.status === 404) {
        return (
          '404: ендпоінт не знайдено. Оновіть бекенд (потрібен GET /api/super-admin/dashboard) ' +
          'або перевірте environment.apiUrl (без зайвого /api в шляху).'
        );
      }
      if (err.status === 0) {
        return (
          'Немає звʼязку з сервером (CORS/мережа). Локально: запустіть Spring на :8080 і ng serve з proxy; ' +
          'у проді: чи відкритий Railway і чи збігається NG_APP_API_URL.'
        );
      }
      return `Помилка завантаження зведення (HTTP ${err.status}). Відкрийте вкладку Network і подивіться URL запиту.`;
    }
    return 'Не вдалося завантажити зведення. Перевірте бекенд і авторизацію.';
  }

  private describeSchoolDashboardError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) {
        return '401: увійдіть знову. Перевірте, що токен дійсний для GET /api/school-admin/dashboard.';
      }
      if (err.status === 404) {
        return '404: не знайдено дашборд школи. Оновіть бекенд або перевірте schoolId.';
      }
      if (err.status === 0) {
        return 'Немає звʼязку з сервером. Запустіть бекенд і proxy для /api.';
      }
      return `Помилка завантаження дашборду школи (HTTP ${err.status}).`;
    }
    return 'Не вдалося завантажити дані школи.';
  }
}
