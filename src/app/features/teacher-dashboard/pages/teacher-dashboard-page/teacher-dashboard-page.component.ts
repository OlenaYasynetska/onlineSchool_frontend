import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import type {
  SchoolGroupCard,
  StudentRow,
} from '../../../school-admin/models/school-admin-dashboard.model';
import { syncGroupCardsStudentsCountFromRoster } from '../../../school-admin/utils/group-student-count.util';
import { AuthService } from '../../../../core/services/auth.service';
import {
  TeacherDashboardService,
  type TeacherActivityEntry,
} from '../../services/teacher-dashboard.service';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import type { ApexAxisChartSeries, ApexYAxis } from 'ng-apexcharts';
import { APEX_LINE_YAXIS_DEFAULT } from '../../../../shared/charts/apex-line-chart-student-style';
import { StarsBySubjectOverTimeSectionComponent } from '../../../../shared/components/stars-by-subject-over-time-section/stars-by-subject-over-time-section.component';

const SUBJECT_LINE_COLORS = [
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#9333ea',
  '#0ea5e9',
  '#ec4899',
  '#64748b',
];

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    EmailLinkComponent,
    StarsBySubjectOverTimeSectionComponent,
  ],
  templateUrl: './teacher-dashboard-page.component.html',
})
export class TeacherDashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherDashboardService);
  private readonly router = inject(Router);

  /** Перший сегмент після `/teacher` — `''` = огляд. */
  readonly cabinetSegment = signal<string>('');

  loading = true;
  /** Немає рядка teachers для цього user id */
  noTeacherProfile = false;
  groups: SchoolGroupCard[] = [];
  students: StudentRow[] = [];
  activity: TeacherActivityEntry[] = [];
  groupSearchQuery = '';
  studentSearchQuery = '';

  /** Період графіка: за замовчуванням поточний місяць (від 1-го числа до сьогодні). */
  readonly trendDateFrom = signal(this.defaultTrendFromIso());
  readonly trendDateTo = signal(this.defaultTrendToIso());
  readonly trendRangeError = signal<string | null>(null);

  readonly trendLabels = signal<string[]>([]);
  readonly trendChartSeries = signal<ApexAxisChartSeries>([]);
  readonly trendChartLoading = signal(false);
  readonly trendChartError = signal<string | null>(null);
  readonly trendChartColors = signal<string[]>([...SUBJECT_LINE_COLORS]);
  readonly trendChartYaxis = signal<ApexYAxis>(APEX_LINE_YAXIS_DEFAULT);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.updateCabinetSegment());
  }

  private updateCabinetSegment(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    if (!url.startsWith('/teacher')) {
      this.cabinetSegment.set('');
      return;
    }
    const rest = url.slice('/teacher'.length).replace(/^\//, '');
    this.cabinetSegment.set((rest.split('/')[0] ?? '').trim());
  }

  get teacherDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Teacher';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Teacher';
  }

  ngOnInit(): void {
    this.updateCabinetSegment();
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      return;
    }
    forkJoin({
      groups: this.api.listMyGroups(u.id),
      students: this.api.listMyStudents(u.id).pipe(
        catchError(() => of<StudentRow[]>([]))
      ),
      activity: this.api.listMyActivity(u.id).pipe(
        catchError(() => of<TeacherActivityEntry[]>([]))
      ),
    }).subscribe({
      next: ({ groups, students, activity }) => {
        this.groups = syncGroupCardsStudentsCountFromRoster(groups, students);
        this.students = students;
        this.activity = activity;
        this.loading = false;
        this.noTeacherProfile = false;
        this.loadHomeworkStarsChart();
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.groups = [];
        this.students = [];
        this.activity = [];
        if (err?.status === 404) {
          this.noTeacherProfile = true;
        }
      },
    });
  }

  onGroupSearchInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.groupSearchQuery = el.value ?? '';
  }

  filteredGroups(): SchoolGroupCard[] {
    const q = this.groupSearchQuery.trim().toLowerCase();
    if (!q) return this.groups;
    return this.groups.filter((g) => {
      const hay = [
        g.name,
        g.code,
        g.topicsLabel,
        g.teacherDisplayName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  onStudentSearchInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.studentSearchQuery = el.value ?? '';
  }

  filteredStudents(): StudentRow[] {
    const q = this.studentSearchQuery.trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter((s) => {
      const hay = [
        s.fullName,
        s.email,
        (s.groupNames ?? []).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  applyTrendRange(): void {
    this.loadHomeworkStarsChart();
  }

  presetTrendMonths(months: number): void {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    start.setMonth(start.getMonth() - (months - 1));
    this.trendDateFrom.set(this.toIsoDate(start));
    this.trendDateTo.set(this.toIsoDate(end));
    this.loadHomeworkStarsChart();
  }

  /** Поточний календарний місяць (від 1-го числа до сьогодні). */
  presetCurrentMonth(): void {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    this.trendDateFrom.set(this.toIsoDate(start));
    this.trendDateTo.set(this.toIsoDate(end));
    this.loadHomeworkStarsChart();
  }

  private defaultTrendFromIso(): string {
    const d = new Date();
    return this.toIsoDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  private defaultTrendToIso(): string {
    return this.toIsoDate(new Date());
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private loadHomeworkStarsChart(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.trendRangeError.set(null);
    this.trendChartError.set(null);
    const a = new Date(this.trendDateFrom() + 'T12:00:00');
    const b = new Date(this.trendDateTo() + 'T12:00:00');
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
      this.trendRangeError.set('Invalid dates.');
      return;
    }
    if (a > b) {
      this.trendRangeError.set('Start date must be before end date.');
      return;
    }
    const daySpan =
      Math.floor((b.getTime() - a.getTime()) / 86_400_000) + 1;
    if (daySpan > 800) {
      this.trendRangeError.set('Choose at most 800 days.');
      return;
    }

    this.trendChartLoading.set(true);
    this.api
      .getHomeworkStarsChart(u.id, this.trendDateFrom(), this.trendDateTo())
      .subscribe({
        next: (data) => {
          const labels = data.bucketLabels ?? [];
          const map = data.starsBySubjectSeries ?? {};
          const keys = Object.keys(map).sort((x, y) =>
            x.localeCompare(y, undefined, { sensitivity: 'base' })
          );
          const n = labels.length;
          const series: ApexAxisChartSeries = keys.map((k) => {
            const raw = map[k] ?? [];
            const dataRow =
              n === 0
                ? []
                : raw.length >= n
                  ? raw.slice(0, n)
                  : [...raw, ...Array(n - raw.length).fill(0)];
            return { name: k, data: dataRow };
          });
          this.trendLabels.set(labels);
          this.trendChartSeries.set(series);
          this.trendChartColors.set(
            keys.map((_, i) => SUBJECT_LINE_COLORS[i % SUBJECT_LINE_COLORS.length])
          );
          this.trendChartYaxis.set(this.computeYaxisForSeries(series));
          this.trendChartLoading.set(false);
        },
        error: (err: unknown) => {
          this.trendChartError.set(this.describeHomeworkChartError(err));
          this.trendChartLoading.set(false);
          this.trendChartSeries.set([]);
          this.trendLabels.set([]);
        },
      });
  }

  private describeHomeworkChartError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      const serverMsg =
        body && typeof body === 'object' && 'message' in body
          ? (body as { message?: unknown }).message
          : undefined;
      const detail =
        typeof serverMsg === 'string' && serverMsg.trim() ? serverMsg.trim() : '';

      if (err.status === 404) {
        return (
          'Chart: API not found (404). Rebuild and restart the education-web backend ' +
          '(main class com.education.web.EducationWebApplication) so ' +
          'GET /api/teacher/homework-stars-chart is on the classpath. ' +
          (detail ? `Server: ${detail}` : '')
        );
      }
      if (detail) {
        return `Chart: ${detail}`;
      }
      return `Chart failed (HTTP ${err.status}). Restart backend after deploy; check server logs.`;
    }
    return 'Could not load homework stars chart.';
  }

  private computeYaxisForSeries(series: ApexAxisChartSeries): ApexYAxis {
    let max = 0;
    for (const s of series) {
      for (const v of s.data as number[]) {
        if (v > max) max = v;
      }
    }
    const cap = max <= 0 ? 5 : Math.max(5, Math.ceil(max / 5) * 5);
    return {
      min: 0,
      max: cap,
      tickAmount: 5,
      labels: {
        style: { colors: '#64748b', fontSize: '11px' },
      },
    };
  }
}
