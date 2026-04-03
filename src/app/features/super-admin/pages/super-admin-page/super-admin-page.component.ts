import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type {
  OrganizationRow,
  PaymentHistoryRow,
  SuperAdminDashboardResponse,
} from '../../models/super-admin-dashboard.model';
import { SchoolGridCardComponent } from '../../components/school-grid-card/school-grid-card.component';

@Component({
  selector: 'app-super-admin-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SchoolGridCardComponent],
  templateUrl: './super-admin-page.component.html',
})
export class SuperAdminPageComponent implements OnInit {
  private readonly dashboardApi = inject(SuperAdminDashboardService);

  loading = true;
  dash: SuperAdminDashboardResponse = {
    planOverview: [],
    schools: [],
    organizations: [],
    payments: [],
  };

  ngOnInit(): void {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.dash = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  orgStatusClass(status: OrganizationRow['status']): string {
    switch (status) {
      case 'Active':
        return 'text-xs font-semibold text-emerald-700';
      case 'Expiring soon':
        return 'text-xs font-semibold text-amber-700';
      case 'Inactive':
        return 'text-xs font-semibold text-slate-500';
      default:
        return '';
    }
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
