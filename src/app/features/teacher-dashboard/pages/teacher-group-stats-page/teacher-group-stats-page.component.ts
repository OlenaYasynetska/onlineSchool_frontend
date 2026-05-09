import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherDashboardService } from '../../services/teacher-dashboard.service';
import type { TeacherGroupStats } from '../../models/teacher-group-stats.model';

@Component({
  selector: 'app-teacher-group-stats-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-group-stats-page.component.html',
})
export class TeacherGroupStatsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherDashboardService);

  loading = true;
  loadError: string | null = null;
  noProfile = false;
  groups: TeacherGroupStats[] = [];

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      this.loadError = 'Not signed in.';
      return;
    }
    this.api.listGroupStats(u.id).subscribe({
      next: (g) => {
        this.groups = g;
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        if (err?.status === 404) {
          this.noProfile = true;
        } else {
          this.loadError = 'Could not load statistics.';
        }
      },
    });
  }
}
