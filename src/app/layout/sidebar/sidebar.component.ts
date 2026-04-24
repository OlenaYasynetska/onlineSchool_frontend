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
  | 'building'
  | 'clipboard'
  | 'lineChart'
  | 'calendar';

export type CompactNavItem = {
  path: string;
  label: string;
  exact?: boolean;
  icon: SidebarNavIcon;
  /** HTML id секції на сторінці school-admin (fragment у URL + scroll). */
  fragment?: string;
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

  readonly teacherNav: CompactNavItem[] = [
    {
      path: '/teacher',
      label: 'Dashboard',
      exact: true,
      icon: 'home',
      fragment: 'teacher-dashboard-top',
    },
    {
      path: '/teacher/groups',
      label: 'Groups',
      icon: 'users',
      fragment: 'teacher-my-groups',
    },
    {
      path: '/teacher/schedule',
      label: 'Schedule',
      icon: 'calendar',
      fragment: 'teacher-schedule',
    },
    {
      path: '/teacher/students',
      label: 'Students',
      icon: 'graduate',
      fragment: 'teacher-students',
    },
    {
      path: '/teacher/homework',
      label: 'Homework',
      icon: 'envelope',
      fragment: 'teacher-homework',
    },
    // Hidden: direct navigation disabled for teachers.
    // {
    //   path: '/teacher/activity',
    //   label: 'My activity',
    //   icon: 'clipboard',
    //   fragment: 'teacher-activity',
    // },
    // {
    //   path: '/teacher/group-stats',
    //   label: 'Groups stars',
    //   icon: 'lineChart',
    //   fragment: 'teacher-group-stats',
    // },
  ];

  readonly schoolAdminNav: CompactNavItem[] = [
    {
      path: '/school-admin',
      label: 'Dashboard',
      exact: true,
      icon: 'home',
      fragment: 'school-admin-top',
    },
    {
      path: '/school-admin/schedule',
      label: 'Schedule',
      icon: 'calendar',
      fragment: 'school-admin-schedule',
    },
    {
      path: '/school-admin/groups',
      label: 'Groups',
      icon: 'users',
      fragment: 'school-admin-groups',
    },
    {
      path: '/school-admin/employees',
      label: 'Employees',
      icon: 'user',
      fragment: 'school-admin-employees',
    },
    {
      path: '/school-admin/teachers',
      label: 'Teachers',
      icon: 'teacher',
      fragment: 'school-admin-teachers',
    },
    {
      path: '/school-admin/students',
      label: 'Students',
      icon: 'graduate',
      fragment: 'school-admin-students',
    },
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

  /** Кабінет учня: огляд і статистика групи (як у макету дашборду). */
  readonly studentNav: CompactNavItem[] = [
    {
      path: '/student',
      label: 'Dashboard',
      exact: true,
      icon: 'home',
      fragment: 'student-top',
    },
    {
      path: '/student/schedule',
      label: 'Schedule',
      icon: 'calendar',
      fragment: 'student-schedule',
    },
    {
      path: '/student/homework',
      label: 'Submit homework',
      icon: 'clipboard',
      fragment: 'student-homework',
    },
    {
      path: '/student/group-stats',
      label: 'My stars',
      icon: 'lineChart',
      fragment: 'student-group-stats',
    },
  ];

  compactSidebar(): { items: CompactNavItem[]; ariaLabel: string } | null {
    if (this.auth.currentUser()?.role === 'TEACHER') {
      return { items: this.teacherNav, ariaLabel: 'Teacher' };
    }
    if (this.auth.currentUser()?.role === 'STUDENT') {
      return { items: this.studentNav, ariaLabel: 'Student' };
    }
    if (this.auth.currentUser()?.role === 'ADMIN_SCHOOL') {
      return { items: this.schoolAdminNav, ariaLabel: 'School admin' };
    }
    if (this.isSuperAdminArea()) {
      return { items: this.superAdminNav, ariaLabel: 'Platform' };
    }
    return null;
  }

  /** Вертикальний сайдбар (іконка над підписом) — лише адмін школи. */
  isSchoolAdminLayout(): boolean {
    return this.auth.currentUser()?.role === 'ADMIN_SCHOOL';
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
