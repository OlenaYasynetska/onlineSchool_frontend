import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarMenuItem } from './navbar-menu-items';

@Component({
  selector: 'app-navbar-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="hidden items-center gap-2 md:flex">
      @for (item of items; track item.id) {
        <a
          [routerLink]="item.route"
          routerLinkActive="bg-primary/10 text-primary"
          class="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          {{ item.label }}
        </a>
      }
    </nav>
  `,
})
export class NavbarMenuComponent {
  @Input({ required: true }) items: NavbarMenuItem[] = [];
}
