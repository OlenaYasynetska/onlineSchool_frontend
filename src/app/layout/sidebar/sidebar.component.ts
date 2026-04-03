import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SchoolAdminDashboardService } from '../../features/school-admin/services/school-admin-dashboard.service';

export type SidebarNavIcon =
  | 'home'
  | 'users'
  | 'user'
  | 'teacher'
  | 'graduate'
  | 'envelope'
  | 'building';

export type CompactNavItem = {
  path: string;
  label: string;
  exact?: boolean;
  icon: SidebarNavIcon;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly schoolDashApi = inject(SchoolAdminDashboardService);

  /** Tariff strip (school admin only) */
  schoolTariffLoading = false;
  schoolTariffPlan = '—';
  schoolTariffAccessEnd = '—';

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (u?.role !== 'ADMIN_SCHOOL' || !u.schoolId) {
      return;
    }
    this.schoolTariffLoading = true;
    this.schoolDashApi.getDashboard(u.schoolId).subscribe({
      next: (d) => {
        this.schoolTariffPlan = d.subscription?.planTitle?.trim() || '—';
        this.schoolTariffAccessEnd =
          d.subscription?.platformAccessEndDate?.trim() || '—';
        this.schoolTariffLoading = false;
      },
      error: () => {
        this.schoolTariffLoading = false;
      },
    });
  }

  readonly schoolAdminNav: CompactNavItem[] = [
    { path: '/school-admin', label: 'Dashboard', exact: true, icon: 'home' },
    { path: '/school-admin/groups', label: 'Groups', icon: 'users' },
    { path: '/school-admin/employees', label: 'Employees', icon: 'user' },
    { path: '/school-admin/teachers', label: 'Teachers', icon: 'teacher' },
    { path: '/school-admin/students', label: 'Students', icon: 'graduate' },
  ];

  readonly superAdminNav: CompactNavItem[] = [
    { path: '/super-admin', label: 'Dashboard', exact: true, icon: 'home' },
    {
      path: '/super-admin/subscribers',
      label: 'Subscribers',
      exact: true,
      icon: 'envelope',
    },
    { path: '/schools', label: 'Schools', icon: 'building' },
    {
      path: '/super-admin/administrators',
      label: 'Admin',
      exact: true,
      icon: 'user',
    },
  ];

  compactSidebar(): { items: CompactNavItem[]; ariaLabel: string } | null {
    if (this.auth.currentUser()?.role === 'ADMIN_SCHOOL') {
      return { items: this.schoolAdminNav, ariaLabel: 'School admin' };
    }
    if (this.isSuperAdminArea()) {
      return { items: this.superAdminNav, ariaLabel: 'Platform' };
    }
    return null;
  }

  isSuperAdminArea(): boolean {
    if (this.auth.currentUser()?.role !== 'SUPER_ADMIN') {
      return false;
    }
    const path = this.router.url.split('?')[0];
    return (
      path.startsWith('/super-admin') || path.startsWith('/schools')
    );
  }
}
