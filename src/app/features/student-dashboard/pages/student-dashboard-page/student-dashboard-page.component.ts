import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

export type StudentLeaderRow = { name: string; stars: number };
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
  imports: [CommonModule],
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
  readonly leaders: StudentLeaderRow[] = [
    { name: 'Alex M.', stars: 154 },
    { name: 'Maria K.', stars: 142 },
    { name: 'Jordan P.', stars: 138 },
    { name: 'Sam T.', stars: 128 },
    { name: 'Chris L.', stars: 121 },
  ];

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

  /** Легенда та точки для SVG-графіка (демо). */
  readonly chartLegend = [
    { name: 'Alex M.', color: '#2563eb' },
    { name: 'Maria K.', color: '#16a34a' },
    { name: 'You', color: '#d97706' },
    { name: 'Jordan P.', color: '#9333ea' },
  ];

  readonly chartMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug'];

  /** Демо-криві для SVG (5 місяців). */
  readonly chartSeries: number[][] = [
    [22, 45, 52, 68, 82],
    [18, 38, 48, 58, 70],
    [12, 28, 35, 42, 52],
    [20, 42, 50, 62, 75],
  ];

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

  /** Прості Y-значення для ліній (0–100) по місяцях. */
  chartPath(values: number[]): string {
    const w = 360;
    const h = 140;
    const pad = 8;
    const n = values.length;
    if (n < 2) return '';
    const min = 0;
    const max = 100;
    const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
    const y = (v: number) =>
      pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(' ');
  }
}
