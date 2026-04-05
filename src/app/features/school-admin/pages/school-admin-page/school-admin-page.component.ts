import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import type {
  PaymentHistoryRow,
  SchoolAdminDashboardResponse,
  SchoolTeacher,
  StudentRow,
} from '../../models/school-admin-dashboard.model';
import { useSchoolAdminDashboard } from '../../hooks/use-school-admin-dashboard.hook';
import { useSchoolAdminGroups } from '../../hooks/use-school-admin-groups.hook';
import { useSchoolAdminQuickActions } from '../../hooks/use-school-admin-quick-actions.hook';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  normalizeSchoolId,
  SESSION_STORAGE_SCHOOL_ID_KEY,
} from '../../utils/school-id.util';
import { AddGroupModalComponent } from '../../components/add-group-modal/add-group-modal.component';
import { AddGroupSuccessModalComponent } from '../../components/add-group-success-modal/add-group-success-modal.component';
import { EditGroupModalComponent } from '../../components/edit-group-modal/edit-group-modal.component';
import { AddTeacherModalComponent } from '../../components/add-teacher-modal/add-teacher-modal.component';
import { AddStudentModalComponent } from '../../components/add-student-modal/add-student-modal.component';

@Component({
  selector: 'app-school-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    AddGroupModalComponent,
    AddGroupSuccessModalComponent,
    EditGroupModalComponent,
    AddTeacherModalComponent,
    AddStudentModalComponent,
  ],
  templateUrl: './school-admin-page.component.html',
})
export class SchoolAdminPageComponent implements OnInit {
  private readonly dashApi = inject(SchoolAdminDashboardService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Перший сегмент після `/school-admin` — `''` означає головний огляд. */
  readonly cabinetSegment = signal<string>('');

  readonly dash: SchoolAdminDashboardResponse = useSchoolAdminDashboard();
  readonly groupsVm = useSchoolAdminGroups(this.dash);
  readonly actionsVm = useSchoolAdminQuickActions(this.dash, () =>
    this.refreshTeachersList()
  );
  loading = true;
  noSchoolAssigned = false;
  teachers: SchoolTeacher[] = [];
  /**
   * UUID школи для API і модалок — виставляється явно (не лише геттер),
   * щоб `[schoolId]` у модалках завжди отримував рядок після завантаження дашборду.
   */
  schoolId = '';
  /** Фільтр таблиці Teachers (як пошук у блоці Students). */
  teacherSearchQuery = '';

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
    if (!url.startsWith('/school-admin')) {
      this.cabinetSegment.set('');
      return;
    }
    const rest = url.slice('/school-admin'.length).replace(/^\//, '');
    this.cabinetSegment.set((rest.split('/')[0] ?? '').trim());
  }

  get adminDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Admin';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Admin';
  }

  /** Порядковий № у таблиці (1, 2, 3…) за датою вступу. */
  sortedStudents(): StudentRow[] {
    return [...(this.dash.students ?? [])].sort((a, b) =>
      a.joinedAt.localeCompare(b.joinedAt)
    );
  }

  onTeacherSearchInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.teacherSearchQuery = el.value ?? '';
  }

  /** Рядки Teachers з урахуванням пошуку (ім'я, email, тел., предмети, групи). */
  filteredTeachers(): SchoolTeacher[] {
    const q = this.teacherSearchQuery.trim().toLowerCase();
    if (!q) {
      return this.teachers;
    }
    return this.teachers.filter((t) => {
      const hay = [
        t.displayName,
        t.email ?? '',
        t.phone ?? '',
        t.subjectTitles.join(' '),
        t.groupNames.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  ngOnInit(): void {
    this.updateCabinetSegment();
    const fromAuth = normalizeSchoolId(this.auth.currentUser()?.schoolId);
    const fromSession =
      typeof sessionStorage !== 'undefined'
        ? normalizeSchoolId(
            sessionStorage.getItem(SESSION_STORAGE_SCHOOL_ID_KEY)
          )
        : '';
    const resolved = fromAuth || fromSession;
    if (!resolved) {
      this.noSchoolAssigned = true;
      this.loading = false;
      return;
    }
    this.schoolId = resolved;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_SCHOOL_ID_KEY, resolved);
    }
    this.loadDashboard(resolved);
  }

  private loadDashboard(schoolId: string): void {
    const id = normalizeSchoolId(schoolId);
    this.schoolId = id;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_SCHOOL_ID_KEY, id);
    }
    this.refreshTeachersList(id);
    this.dashApi.getDashboard(id).subscribe({
      next: (data) => {
        Object.assign(this.dash, data);
        const echoed = normalizeSchoolId(data.schoolId);
        if (echoed) {
          this.schoolId = echoed;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_STORAGE_SCHOOL_ID_KEY, echoed);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  private refreshTeachersList(schoolId?: string): void {
    const id = normalizeSchoolId(
      schoolId ?? this.schoolId ?? this.auth.currentUser()?.schoolId
    );
    if (!id) {
      this.teachers = [];
      return;
    }
    this.dashApi.listTeachers(id).subscribe({
      next: (list) => {
        this.teachers = list;
      },
      error: () => {
        this.teachers = [];
      },
    });
  }

  get pendingPaymentsCount(): number {
    return this.dash.payments.filter((p) => p.status === 'Pending payment')
      .length;
  }

  get failedPaymentsCount(): number {
    return this.dash.payments.filter((p) => p.status === 'Failed').length;
  }

  paymentStatusClass(status: PaymentHistoryRow['status']): string {
    switch (status) {
      case 'Paid':
        return 'text-xs font-semibold text-emerald-700';
      case 'Pending payment':
        return 'text-xs font-semibold text-amber-700';
      case 'Failed':
        return 'text-xs font-semibold text-red-600';
      default:
        return '';
    }
  }
}
