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
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import {
  APEX_LINE_GRID,
  APEX_LINE_LEGEND,
  APEX_LINE_PLOT_OPTIONS,
  APEX_LINE_STROKE,
  APEX_LINE_TOOLTIP,
  APEX_LINE_YAXIS_DEFAULT,
  createApexLineChart,
} from '../../../../shared/charts/apex-line-chart-student-style';

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

  /** Той самий `ApexChart`, що й у учня (`shared/charts/apex-line-chart-student-style`). */
  readonly groupTrendChartConfig: ApexChart = createApexLineChart(
    'teacher-dashboard-group-trends'
  );

  readonly groupTrendStroke = APEX_LINE_STROKE;

  readonly groupTrendPlotOptions: ApexPlotOptions = APEX_LINE_PLOT_OPTIONS;

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

  readonly groupTrendYaxis: ApexYAxis = APEX_LINE_YAXIS_DEFAULT;

  readonly groupTrendLegend = APEX_LINE_LEGEND;

  readonly groupTrendGrid = APEX_LINE_GRID;

  readonly groupTrendTooltip = APEX_LINE_TOOLTIP;

  /** Як у student-dashboard (лінії предметів). */
  readonly groupTrendColors: string[] = ['#2563eb', '#16a34a'];

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

  /**
   * Демо-ряди з «хвилястою» формою як у учня (не лінійний 20→95),
   * інакше smooth-line виглядає майже прямою.
   */
  private buildDemoSeriesPair(n: number): [number[], number[]] {
    if (n <= 0) return [[], []];
    const baseA = [22, 45, 52, 68, 82];
    const baseB = [18, 38, 48, 58, 70];
    return [this.resampleDemoSeries(baseA, n), this.resampleDemoSeries(baseB, n)];
  }

  private resampleDemoSeries(template: number[], len: number): number[] {
    if (len <= 0) return [];
    if (len === 1) {
      return [Math.round(template[template.length - 1])];
    }
    if (len <= template.length) {
      return template.slice(0, len).map((v) => Math.round(v));
    }
    const out: number[] = [];
    const maxI = template.length - 1;
    for (let i = 0; i < len; i++) {
      const u = (i / (len - 1)) * maxI;
      const j = Math.floor(u);
      const f = u - j;
      const v =
        j < maxI
          ? template[j] * (1 - f) + template[j + 1] * f
          : template[maxI];
      out.push(Math.round(v));
    }
    return out;
  }
}
