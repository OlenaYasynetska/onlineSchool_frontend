import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
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
import { NgApexchartsModule } from 'ng-apexcharts';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgApexchartsModule, EmailLinkComponent],
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

  /** Демо-графік: діапазон дат і серії перераховуються (до live API). */
  readonly trendDateFrom = signal(this.defaultTrendFromIso());
  readonly trendDateTo = signal(this.defaultTrendToIso());
  readonly trendRangeError = signal<string | null>(null);

  private readonly trendLabels = signal<string[]>([]);
  private readonly trendDataA = signal<number[]>([]);
  private readonly trendDataB = signal<number[]>([]);

  readonly groupTrendSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Group A (demo)', data: this.trendDataA() },
    { name: 'Group B (demo)', data: this.trendDataB() },
  ]);

  readonly groupTrendChart = computed<ApexChart>(() => {
    const n = this.trendLabels().length;
    const h = Math.min(480, Math.max(220, 160 + Math.min(n, 24) * 14));
    return {
      type: 'area',
      id: 'teacher-dashboard-group-trends',
      height: h,
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      animations: { enabled: true, easing: 'easeinout', speed: 500 },
    };
  });

  readonly groupTrendStroke: ApexStroke = {
    curve: 'smooth',
    width: 2.5,
  };

  readonly groupTrendFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.06,
      stops: [0, 92, 100],
    },
  };

  readonly groupTrendXaxis = computed<ApexXAxis>(() => ({
    categories: this.trendLabels(),
    labels: {
      style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
      rotate: this.trendLabels().length > 10 ? -45 : 0,
      maxHeight: 52,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  readonly groupTrendYaxis: ApexYAxis = {
    labels: {
      style: { colors: '#64748b', fontSize: '11px' },
    },
  };

  readonly groupTrendLegend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '12px',
    fontWeight: 500,
    labels: { colors: '#334155' },
    markers: { strokeWidth: 0 },
  };

  readonly groupTrendGrid: ApexGrid = {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
    padding: { top: 8, right: 12, bottom: 0, left: 12 },
    xaxis: { lines: { show: false } },
  };

  readonly groupTrendTooltip: ApexTooltip = {
    theme: 'light',
    shared: true,
    intersect: false,
  };

  readonly groupTrendColors: string[] = ['#3b82f6', '#22c55e'];

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
    this.rebuildTrendDemoFromRange();
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
    this.rebuildTrendDemoFromRange();
  }

  presetTrendMonths(months: number): void {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    start.setMonth(start.getMonth() - (months - 1));
    this.trendDateFrom.set(this.toIsoDate(start));
    this.trendDateTo.set(this.toIsoDate(end));
    this.rebuildTrendDemoFromRange();
  }

  private defaultTrendFromIso(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return this.toIsoDate(d);
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

  private rebuildTrendDemoFromRange(): void {
    this.trendRangeError.set(null);
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
    const labels = this.monthLabelsBetween(a, b);
    const maxMonths = 36;
    if (labels.length > maxMonths) {
      this.trendRangeError.set(`Choose at most ${maxMonths} months (narrow the range).`);
      return;
    }
    if (labels.length === 0) {
      this.trendLabels.set([]);
      this.trendDataA.set([]);
      this.trendDataB.set([]);
      return;
    }
    const [dataA, dataB] = this.buildDemoSeriesPair(labels.length);
    this.trendLabels.set(labels);
    this.trendDataA.set(dataA);
    this.trendDataB.set(dataB);
  }

  private monthLabelsBetween(start: Date, end: Date): string[] {
    const labels: string[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      labels.push(
        cur.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      );
      cur.setMonth(cur.getMonth() + 1);
    }
    return labels;
  }

  /** Детерміновані «тренди» для демо (замініть відповіддю API). */
  private buildDemoSeriesPair(n: number): [number[], number[]] {
    if (n <= 0) return [[], []];
    if (n === 1) return [[52], [48]];
    const a: number[] = [];
    const b: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      a.push(Math.round(20 + t * 75));
      b.push(Math.round(15 + t * 73));
    }
    return [a, b];
  }
}
