import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NavbarMenuComponent } from './navbar-menu.component';
import { NAVBAR_MENU_ITEMS } from './navbar-menu-items';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonComponent, NavbarMenuComponent],
  template: `
    <header class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-center gap-6">
        <span class="text-lg font-semibold text-gray-900 dark:text-white">Education Platform</span>
        <app-navbar-menu [items]="menuItems" />
      </div>
      <div class="flex items-center gap-4">
        @if (auth.currentUser(); as user) {
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ user.firstName }} {{ user.lastName }}</span>
          <app-button (click)="auth.logout()">Вийти</app-button>
        }
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly menuItems = NAVBAR_MENU_ITEMS;

  constructor(readonly auth: AuthService) {}
}
