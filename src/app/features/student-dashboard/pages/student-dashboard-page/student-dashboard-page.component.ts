import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { AuthService } from '../../../../core/services/auth.service';

export type StudentRewardRow = {
  date: string;
  teacher: string;
  subject: string;
  change: number;
  reason: string;
};
export type StudentSubjectRow = {
  id: string;
  subject: string;
  teacher: string;
  starsTotal: number;
  course: string;
};

@Component({
  selector: 'app-student-dashboard-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './student-dashboard-page.component.html',
})
export class StudentDashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Перший сегмент після `/student`. */
  readonly cabinetSegment = signal<string>('');

  /** Загальна кількість зірок (пізніше — з API). */
  readonly totalStars = 0;
  readonly weekGain = 0;
  readonly monthGain = 0;

  /** Демо-дані для таблиць і графіка; заміняться відповідями бекенду. */
  readonly rewardLog: StudentRewardRow[] = [
    {
      date: '02.04.2026',
      teacher: 'I. Petrenko',
      subject: 'JavaScript',
      change: 1,
      reason: 'Class participation',
    },
    {
      date: '01.04.2026',
      teacher: 'I. Petrenko',
      subject: 'HTML',
      change: 2,
      reason: 'Homework submitted',
    },
    {
      date: '28.03.2026',
      teacher: 'O. Shevchenko',
      subject: 'React',
      change: -1,
      reason: 'Late submission',
    },
    {
      date: '25.03.2026',
      teacher: 'I. Petrenko',
      subject: 'CSS',
      change: 1,
      reason: 'Quiz',
    },
    {
      date: '20.03.2026',
      teacher: 'O. Shevchenko',
      subject: 'JavaScript',
      change: 3,
      reason: 'Project milestone',
    },
  ];

  /** Предмети учня (демо); з них же будуються графік і таблиця «зірки за предметом». */
  readonly subjects: StudentSubjectRow[] = [
    {
      id: 'S-101',
      subject: 'JavaScript',
      teacher: 'I. Petrenko',
      starsTotal: 24,
      course: 'Web basics',
    },
    {
      id: 'S-102',
      subject: 'React',
      teacher: 'O. Shevchenko',
      starsTotal: 18,
      course: 'Web basics',
    },
    {
      id: 'S-103',
      subject: 'HTML & CSS',
      teacher: 'I. Petrenko',
      starsTotal: 32,
      course: 'Web basics',
    },
  ];

  readonly chartMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug'];

  /** Демо: накопичення зірок у часі — по одному ряду на предмет (як у `subjects`). */
  readonly chartSeriesBySubject: number[][] = [
    [22, 45, 52, 68, 82],
    [18, 38, 48, 58, 70],
    [12, 28, 35, 42, 52],
  ];

  private readonly subjectLineColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

  readonly groupStatsSeries: ApexAxisChartSeries = this.subjects.map((s, i) => ({
    name: s.subject,
    data: this.chartSeriesBySubject[i] ?? [],
  }));

  readonly groupStatsColors: string[] = this.subjects.map(
    (_, i) => this.subjectLineColors[i % this.subjectLineColors.length]
  );

  readonly groupStatsChart: ApexChart = {
    type: 'line',
    height: 300,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    animations: { enabled: true, easing: 'easeinout', speed: 450 },
  };

  readonly groupStatsStroke: ApexStroke = {
    curve: 'smooth',
    width: 2.5,
  };

  readonly groupStatsXaxis: ApexXAxis = {
    categories: this.chartMonths,
    labels: {
      style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  readonly groupStatsYaxis: ApexYAxis = {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: {
      style: { colors: '#64748b', fontSize: '11px' },
    },
  };

  readonly groupStatsLegend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'left',
    offsetY: 0,
    fontSize: '12px',
    fontWeight: 500,
    labels: { colors: '#334155' },
    markers: { strokeWidth: 0 },
  };

  readonly groupStatsGrid: ApexGrid = {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
    padding: { top: 8, right: 0, bottom: 0, left: 12 },
    xaxis: { lines: { show: false } },
  };

  readonly groupStatsTooltip: ApexTooltip = {
    theme: 'light',
    shared: true,
    intersect: false,
  };

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.updateCabinetSegment();
        this.scheduleScrollToRouteSection();
      });
  }

  get displayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Student';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Student';
  }

  ngOnInit(): void {
    this.updateCabinetSegment();
    queueMicrotask(() => this.scheduleScrollToRouteSection());
  }

  private updateCabinetSegment(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    if (!url.startsWith('/student')) {
      this.cabinetSegment.set('');
      return;
    }
    const rest = url.slice('/student'.length).replace(/^\//, '');
    this.cabinetSegment.set((rest.split('/')[0] ?? '').trim());
  }

  private routeSectionAnchorId(): string | null {
    const seg = this.cabinetSegment();
    const map: Record<string, string> = {
      '': 'student-top',
      'group-stats': 'student-group-stats',
      groups: 'student-groups',
      schedule: 'student-schedule',
    };
    return map[seg] ?? null;
  }

  private scheduleScrollToRouteSection(): void {
    const id = this.routeSectionAnchorId();
    if (!id || typeof document === 'undefined') return;
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    queueMicrotask(scroll);
    setTimeout(scroll, 120);
  }

  /** Предмети за спаданням зірок (для картки поруч із графіком). */
  subjectsByStars(): StudentSubjectRow[] {
    return [...this.subjects].sort((a, b) => b.starsTotal - a.starsTotal);
  }
}
