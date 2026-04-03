import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminDashboardService } from '../../../super-admin/services/super-admin-dashboard.service';
import { SchoolGridCardComponent } from '../../../super-admin/components/school-grid-card/school-grid-card.component';
import type { SchoolCard } from '../../../super-admin/models/super-admin-dashboard.model';

@Component({
  selector: 'app-schools-list',
  standalone: true,
  imports: [CommonModule, SchoolGridCardComponent],
  templateUrl: './schools-list.component.html',
})
export class SchoolsListComponent implements OnInit {
  private readonly dashboardApi = inject(SuperAdminDashboardService);

  loading = true;
  error: string | null = null;
  schools: SchoolCard[] = [];

  ngOnInit(): void {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.schools = data.schools ?? [];
        this.loading = false;
      },
      error: () => {
        this.error =
          'Could not load schools. Check that the API is running and you are online.';
        this.loading = false;
      },
    });
  }
}
