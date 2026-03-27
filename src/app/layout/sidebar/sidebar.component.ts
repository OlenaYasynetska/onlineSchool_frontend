import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="flex w-64 flex-col border-r border-slate-200 bg-slate-50/90 dark:border-gray-700 dark:bg-gray-800"
    >
      <nav class="flex-1 space-y-0.5 p-3">
        @if (isSuperAdminArea()) {
          <p
            class="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Platform
          </p>
          @for (item of superAdminNav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-white font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200/80"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white/80 dark:text-gray-300"
            >
              {{ item.label }}
            </a>
          }
        } @else {
          @if (auth.currentUser()?.role === 'SUPER_ADMIN') {
            <a
              routerLink="/super-admin"
              routerLinkActive="bg-primary/10 text-primary"
              class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Super Admin
            </a>
          }
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary/10 text-primary"
            class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Dashboard
          </a>
          <a
            routerLink="/students"
            routerLinkActive="bg-primary/10 text-primary"
            class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Учні
          </a>
          <a
            routerLink="/teachers"
            routerLinkActive="bg-primary/10 text-primary"
            class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Вчителі
          </a>
          <a
            routerLink="/schools"
            routerLinkActive="bg-primary/10 text-primary"
            class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Школи
          </a>
          <a
            routerLink="/analytics"
            routerLinkActive="bg-primary/10 text-primary"
            class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Аналітика
          </a>
        }
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly superAdminNav: {
    path: string;
    label: string;
    exact?: boolean;
  }[] = [
    { path: '/super-admin', label: 'Dashboard', exact: true },
    { path: '/super-admin', label: 'Subscribers' },
    { path: '/schools', label: 'Schools' },
    { path: '/super-admin', label: 'Admins' },
    { path: '/super-admin', label: 'Employees' },
    { path: '/teachers', label: 'Teachers' },
    { path: '/students', label: 'Students' },
    { path: '/super-admin', label: 'Groups' },
    { path: '/super-admin', label: 'Programs' },
    { path: '/super-admin', label: 'Subjects' },
  ];

  isSuperAdminArea(): boolean {
    return (
      this.auth.currentUser()?.role === 'SUPER_ADMIN' &&
      this.router.url.split('?')[0].startsWith('/super-admin')
    );
  }
}
