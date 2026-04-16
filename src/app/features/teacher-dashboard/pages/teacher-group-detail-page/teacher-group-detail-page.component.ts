import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import type {
  SchoolGroupCard,
  StudentRow,
} from '../../../school-admin/models/school-admin-dashboard.model';
import type { TeacherGroupStats } from '../../models/teacher-group-stats.model';
import { countStudentsInGroupForRoster } from '../../../school-admin/utils/group-student-count.util';
import { AuthService } from '../../../../core/services/auth.service';
import {
  TeacherDashboardService,
  type TeacherActivityEntry,
} from '../../services/teacher-dashboard.service';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';

@Component({
  selector: 'app-teacher-group-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmailLinkComponent],
  templateUrl: './teacher-group-detail-page.component.html',
})
export class TeacherGroupDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TeacherDashboardService);
  private readonly auth = inject(AuthService);

  groupId = '';
  group: SchoolGroupCard | null = null;
  students: StudentRow[] = [];
  activity: TeacherActivityEntry[] = [];
  /** Статистика ДЗ по групі (зірки по предметах з БД), для графіка на цій сторінці. */
  groupStats: TeacherGroupStats | null = null;
  /** Обраний предмет для стовпчикового графіка «усі учні класу». */
  selectedChartSubject = '';
  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('groupId');
      if (!id) {
        this.notFound = true;
        this.loading = false;
        return;
      }
      this.groupId = id;
      const u = this.auth.currentUser();
      if (!u?.id) {
        this.loading = false;
        void this.router.navigate(['/teacher']);
        return;
      }
      this.loading = true;
      forkJoin({
        groups: this.api.listMyGroups(u.id),
        students: this.api.listMyStudents(u.id).pipe(
          catchError(() => of<StudentRow[]>([]))
        ),
        activity: this.api.listMyActivity(u.id).pipe(
          catchError(() => of<TeacherActivityEntry[]>([]))
        ),
        stats: this.api.listGroupStats(u.id).pipe(
          catchError(() => of<TeacherGroupStats[]>([]))
        ),
      }).subscribe({
        next: ({ groups, students, activity, stats }) => {
          const g = groups.find((x) => x.id === id) ?? null;
          if (!g) {
            this.notFound = true;
            this.group = null;
          } else {
            const cnt = countStudentsInGroupForRoster(g.name, students);
            this.group = { ...g, studentsCount: cnt };
            this.notFound = false;
          }
          this.students = students;
          this.activity = activity;
          const gs = stats.find((s) => s.groupId === id) ?? null;
          this.groupStats = gs;
          this.selectedChartSubject =
            gs?.subjectTitles?.length && gs.subjectTitles[0]
              ? gs.subjectTitles[0]
              : '';
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notFound = true;
        },
      });
    });
  }

  studentsInGroup(): StudentRow[] {
    const g = this.group;
    if (!g) return [];
    return this.students.filter((s) => s.groupNames?.includes(g.name));
  }

  activityForGroup(): TeacherActivityEntry[] {
    const g = this.group;
    if (!g) return [];
    return this.activity.filter((a) => a.reason.includes(g.name));
  }

  /** Учні з оцінками (зірки) по обраному предмету — для стовпчиків. */
  studentBarsForChart(): {
    studentId: string;
    fullName: string;
    label: string;
    stars: number;
  }[] {
    const gs = this.groupStats;
    const sub = this.selectedChartSubject?.trim();
    if (!gs || !sub) return [];
    return gs.students.map((s) => ({
      studentId: s.studentId,
      fullName: s.fullName,
      label: this.shortLabelForBar(s.fullName),
      stars: s.starsBySubject[sub] ?? 0,
    }));
  }

  maxStarsInChart(): number {
    const rows = this.studentBarsForChart();
    if (rows.length === 0) return 1;
    const m = Math.max(...rows.map((r) => r.stars), 0);
    return m > 0 ? m : 1;
  }

  barHeightPercent(stars: number): number {
    return (stars / this.maxStarsInChart()) * 100;
  }

  onChartSubjectChange(ev: Event): void {
    const t = ev.target as HTMLSelectElement;
    this.selectedChartSubject = t.value;
  }

  private shortLabelForBar(fullName: string): string {
    const t = fullName?.trim() ?? '';
    if (!t) return '—';
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].length > 10 ? parts[0].slice(0, 9) + '…' : parts[0];
    }
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
  }

  /** Рядки для списку «Courses included» з topicsLabel. */
  topicLines(): string[] {
    const g = this.group;
    if (g?.showSubjectOnCard === false) return [];
    if (!g?.topicsLabel?.trim()) return [];
    return g.topicsLabel
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
