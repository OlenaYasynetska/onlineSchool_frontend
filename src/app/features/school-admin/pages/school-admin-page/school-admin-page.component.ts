import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type {
  PaymentHistoryRow,
  SchoolAdminDashboardResponse,
  SchoolTeacher,
} from '../../models/school-admin-dashboard.model';
import { useSchoolAdminCabinetSegment } from '../../hooks/use-school-admin-cabinet-segment.hook';
import { useSchoolAdminDashboard } from '../../hooks/use-school-admin-dashboard.hook';
import { useSchoolAdminGroups } from '../../hooks/use-school-admin-groups.hook';
import { useSchoolAdminQuickActions } from '../../hooks/use-school-admin-quick-actions.hook';
import { useSchoolAdminStudentsFilter } from '../../hooks/use-school-admin-students-filter.hook';
import { useSchoolAdminTeachersFilter } from '../../hooks/use-school-admin-teachers-filter.hook';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';
import { SchoolAdminSettingsService } from '../../services/school-admin-settings.service';
import type { GradingMethod } from '../../../../shared/hooks/use-grading-display.hook';
import { AuthService } from '../../../../core/services/auth.service';
import {
  normalizeSchoolId,
  SESSION_STORAGE_SCHOOL_ID_KEY,
} from '../../utils/school-id.util';
import { syncGroupCountsInDashboard } from '../../utils/group-student-count.util';
import { AddGroupModalComponent } from '../../components/add-group-modal/add-group-modal.component';
import { AddGroupSuccessModalComponent } from '../../components/add-group-success-modal/add-group-success-modal.component';
import { EditGroupModalComponent } from '../../components/edit-group-modal/edit-group-modal.component';
import { AddTeacherModalComponent } from '../../components/add-teacher-modal/add-teacher-modal.component';
import { AddStudentModalComponent } from '../../components/add-student-modal/add-student-modal.component';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import { TeacherGridCardComponent } from '../../components/teacher-grid-card/teacher-grid-card.component';
import { StudentGridCardComponent } from '../../components/student-grid-card/student-grid-card.component';
import { useResponsiveAdminTableLayout } from '../../../../shared/hooks/use-responsive-admin-table-layout.hook';
import { useAdminFilterFieldLayout } from '../../../../shared/hooks/use-admin-filter-field-layout.hook';

@Component({
  selector: 'app-school-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    EmailLinkComponent,
    TeacherGridCardComponent,
    StudentGridCardComponent,
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
  private readonly settingsApi = inject(SchoolAdminSettingsService);
  private readonly auth = inject(AuthService);

  readonly cabinetSegment = useSchoolAdminCabinetSegment().cabinetSegment;

  readonly dash: SchoolAdminDashboardResponse = useSchoolAdminDashboard();
  readonly groupsVm = useSchoolAdminGroups(this.dash);
  readonly actionsVm = useSchoolAdminQuickActions(this.dash, () =>
    this.refreshTeachersList()
  );
  teachers: SchoolTeacher[] = [];
  readonly teachersVm = useSchoolAdminTeachersFilter(() => this.teachers);
  readonly studentsVm = useSchoolAdminStudentsFilter(() => ({
    students: this.dash.students,
    groups: this.dash.groups,
  }));
  readonly tableLayout = useResponsiveAdminTableLayout();
  readonly filterField = useAdminFilterFieldLayout();
  loading = true;
  noSchoolAssigned = false;
  /**
   * UUID школи для API і модалок — виставляється явно (не лише геттер),
   * щоб `[schoolId]` у модалках завжди отримував рядок після завантаження дашборду.
   */
  schoolId = '';
  gradingMethod: GradingMethod = 'sum';
  settingsSaving = false;
  settingsSaved = false;
  settingsError: string | null = null;

  get adminDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Admin';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Admin';
  }

  ngOnInit(): void {
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
    this.loadGradingSettings(id);
    this.dashApi.getDashboard(id).subscribe({
      next: (data) => {
        Object.assign(this.dash, data);
        syncGroupCountsInDashboard(this.dash);
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

  private loadGradingSettings(schoolId: string): void {
    this.settingsApi.getSettings(schoolId).subscribe({
      next: (settings) => {
        this.gradingMethod =
          settings.gradingMethod === 'average' ? 'average' : 'sum';
      },
      error: () => {
        this.gradingMethod = 'sum';
      },
    });
  }

  onGradingMethodChange(value: string): void {
    this.gradingMethod = value === 'average' ? 'average' : 'sum';
    this.settingsSaved = false;
    this.settingsError = null;
  }

  saveGradingSettings(): void {
    const id = normalizeSchoolId(this.schoolId);
    if (!id) {
      return;
    }
    this.settingsSaving = true;
    this.settingsSaved = false;
    this.settingsError = null;
    this.settingsApi.updateSettings(id, this.gradingMethod).subscribe({
      next: (settings) => {
        this.gradingMethod =
          settings.gradingMethod === 'average' ? 'average' : 'sum';
        this.settingsSaving = false;
        this.settingsSaved = true;
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.settingsSaving = false;
        if (err?.status === 404) {
          this.settingsError =
            'Settings API not found. Restart the backend (migration V26 + new code).';
        } else if (err?.status === 0) {
          this.settingsError = 'Cannot reach the server. Is the backend running?';
        } else {
          const detail = err?.error?.message?.trim();
          this.settingsError = detail
            ? detail
            : `Could not save grading settings (HTTP ${err?.status ?? '?'}).`;
        }
      },
    });
  }
}
