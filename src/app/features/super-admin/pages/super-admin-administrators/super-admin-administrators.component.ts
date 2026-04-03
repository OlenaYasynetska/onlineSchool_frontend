import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type { SchoolAdminContactRow } from '../../models/super-admin-dashboard.model';

@Component({
  selector: 'app-super-admin-administrators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-administrators.component.html',
})
export class SuperAdminAdministratorsComponent implements OnInit {
  private readonly api = inject(SuperAdminDashboardService);

  loading = true;
  rows: SchoolAdminContactRow[] = [];

  ngOnInit(): void {
    this.api.getSchoolAdmins().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
}
