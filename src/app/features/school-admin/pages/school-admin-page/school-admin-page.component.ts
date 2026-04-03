import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type {
  PaymentHistoryRow,
  SchoolAdminDashboardResponse,
} from '../../models/school-admin-dashboard.model';
import { useSchoolAdminDashboard } from '../../hooks/use-school-admin-dashboard.hook';
import { useSchoolAdminGroups } from '../../hooks/use-school-admin-groups.hook';
import { useSchoolAdminQuickActions } from '../../hooks/use-school-admin-quick-actions.hook';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AddGroupModalComponent } from '../../components/add-group-modal/add-group-modal.component';
import { AddGroupSuccessModalComponent } from '../../components/add-group-success-modal/add-group-success-modal.component';
import { EditGroupModalComponent } from '../../components/edit-group-modal/edit-group-modal.component';
import { AddTeacherModalComponent } from '../../components/add-teacher-modal/add-teacher-modal.component';
@Component({
  selector: 'app-school-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    AddGroupModalComponent,
    AddGroupSuccessModalComponent,
    EditGroupModalComponent,
    AddTeacherModalComponent,
  ],
  templateUrl: './school-admin-page.component.html',
})
export class SchoolAdminPageComponent implements OnInit {
  private readonly dashApi = inject(SchoolAdminDashboardService);
  private readonly auth = inject(AuthService);

  readonly dash: SchoolAdminDashboardResponse = useSchoolAdminDashboard();
  readonly groupsVm = useSchoolAdminGroups(this.dash);
  readonly actionsVm = useSchoolAdminQuickActions(this.dash);
  loading = true;
  noSchoolAssigned = false;

  get adminDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Admin';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Admin';
  }

  /** ID організації (школи) для API предметів / груп. */
  get schoolId(): string {
    return this.auth.currentUser()?.schoolId ?? '';
  }

  ngOnInit(): void {
    const schoolId = this.auth.currentUser()?.schoolId;
    if (!schoolId) {
      this.noSchoolAssigned = true;
      this.loading = false;
      return;
    }
    this.loadDashboard(schoolId);
  }

  private loadDashboard(schoolId: string): void {
    this.dashApi.getDashboard(schoolId).subscribe({
      next: (data) => {
        Object.assign(this.dash, data);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
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
