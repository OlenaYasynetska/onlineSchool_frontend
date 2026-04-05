import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { catchError, filter } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import type {
  SchoolGroupCard,
  StudentRow,
} from '../../../school-admin/models/school-admin-dashboard.model';
import { AuthService } from '../../../../core/services/auth.service';
import {
  TeacherDashboardService,
  type TeacherActivityEntry,
} from '../../services/teacher-dashboard.service';

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        this.groups = groups;
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
