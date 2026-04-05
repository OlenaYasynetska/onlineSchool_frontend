import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
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
  selector: 'app-teacher-group-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
      }).subscribe({
        next: ({ groups, students, activity }) => {
          const g = groups.find((x) => x.id === id) ?? null;
          if (!g) {
            this.notFound = true;
            this.group = null;
          } else {
            this.group = g;
            this.notFound = false;
          }
          this.students = students;
          this.activity = activity;
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

  /** Демо-точки для міні-графіка (як на макеті); пізніше — API. */
  chartDemo = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    series: [12, 28, 42, 55, 68, 82, 95],
  };

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

  /** Рядки для списку «Courses included» з topicsLabel. */
  topicLines(): string[] {
    const g = this.group;
    if (!g?.topicsLabel?.trim()) return [];
    return g.topicsLabel
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
