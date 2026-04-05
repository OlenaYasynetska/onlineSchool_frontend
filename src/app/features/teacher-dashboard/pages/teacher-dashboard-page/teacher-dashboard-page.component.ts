import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import type { SchoolGroupCard } from '../../../school-admin/models/school-admin-dashboard.model';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherDashboardService } from '../../services/teacher-dashboard.service';

export interface TeacherActivityRow {
  date: string;
  studentName: string;
  change: number;
  reason: string;
}

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard-page.component.html',
})
export class TeacherDashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherDashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = true;
  /** Немає рядка teachers для цього user id */
  noTeacherProfile = false;
  groups: SchoolGroupCard[] = [];
  groupSearchQuery = '';

  /** Демо-дані журналу (поки немає API). */
  readonly demoActivity: TeacherActivityRow[] = [
    {
      date: '15.01.2026',
      studentName: 'Oleg Boiko',
      change: 1,
      reason: 'Class participation',
    },
    {
      date: '14.01.2026',
      studentName: 'Maria Kovalenko',
      change: -1,
      reason: 'Missing assignment',
    },
    {
      date: '12.01.2026',
      studentName: 'Anna Shevchenko',
      change: 1,
      reason: 'Extra credit',
    },
  ];

  /** Демо-точки для лінійного графіка (два ряди). */
  readonly chartDemo = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    seriesA: [20, 35, 42, 55, 68, 82, 95],
    seriesB: [15, 28, 38, 48, 60, 72, 88],
  };

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        const path = this.router.url.split('?')[0].split('#')[0];
        if (!path.startsWith('/teacher')) return;
        this.scheduleScrollToRouteSection();
      });
  }

  get teacherDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Teacher';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Teacher';
  }

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      return;
    }
    this.api.listMyGroups(u.id).subscribe({
      next: (list) => {
        this.groups = list;
        this.loading = false;
        this.noTeacherProfile = false;
        this.scheduleScrollToRouteSection();
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.groups = [];
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

  private routeSectionAnchorId(): string | null {
    const seg = this.route.snapshot.url[0]?.path ?? '';
    const map: Record<string, string> = {
      '': 'teacher-dashboard-top',
      groups: 'teacher-my-groups',
      students: 'teacher-students',
      activity: 'teacher-activity',
      'group-stats': 'teacher-group-stats',
    };
    return map[seg] ?? null;
  }

  private scheduleScrollToRouteSection(): void {
    if (this.loading || this.noTeacherProfile) return;
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

  /** Координати для SVG polyline (0–100 по X та Y). */
  chartLinePoints(values: number[]): string {
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }
}
